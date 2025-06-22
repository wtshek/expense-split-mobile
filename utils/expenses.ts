import {
  getCurrentUserId,
  handleSupabaseError,
  supabase,
} from "@/lib/supabase";
import {
  DatabaseListResponse,
  DatabaseResponse,
  DateRange,
  Expense,
  ExpenseFilters,
  ExpenseInsert,
  ExpenseStats,
  ExpenseUpdate,
  ExpenseWithDetails,
  SplitDetails,
} from "@/types/database";

// Insert a new expense record into the expenses table
export const addExpense = async (
  expenseData: ExpenseInsert
): Promise<DatabaseResponse<Expense>> => {
  try {
    // Verify that the current user is authorized to create this expense
    const currentUserId = await getCurrentUserId();
    if (!currentUserId) {
      return {
        data: null,
        error: new Error("No authenticated user found"),
      };
    }

    // Ensure the paid_by_profile_id is the current user or they're part of involved profiles
    if (
      expenseData.paid_by_profile_id !== currentUserId &&
      !expenseData.involved_profile_ids.includes(currentUserId)
    ) {
      return {
        data: null,
        error: new Error(
          "Unauthorized: You can only create expenses you are involved in"
        ),
      };
    }

    const { data, error } = await supabase
      .from("expenses")
      .insert(expenseData)
      .select()
      .single();

    if (error) {
      return { data: null, error: handleSupabaseError(error) };
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error: handleSupabaseError(error) };
  }
};

// Fetch expenses relevant to a specific userId
export const fetchExpenses = async (
  userId: string,
  groupId: string | null = null,
  filters?: ExpenseFilters,
  limit?: number,
  offset?: number
): Promise<DatabaseListResponse<ExpenseWithDetails>> => {
  try {
    let query = supabase
      .from("expenses")
      .select(
        `
        *,
        category:categories(id, name, icon),
        paid_by_profile:profiles!paid_by_profile_id(id, name),
        group:groups(id, name, owner_id)
      `
      )
      .order("expense_date", { ascending: false });

    // Base filter: user must be involved in the expense
    query = query.contains("involved_profile_ids", [userId]);

    // Group-specific filtering
    if (groupId) {
      query = query.eq("group_id", groupId);
    }

    // Apply additional filters
    if (filters) {
      if (filters.category_id) {
        query = query.eq("category_id", filters.category_id);
      }
      if (filters.is_group_expense !== undefined) {
        query = query.eq("is_group_expense", filters.is_group_expense);
      }
      if (filters.paid_by_profile_id) {
        query = query.eq("paid_by_profile_id", filters.paid_by_profile_id);
      }
      if (filters.date_from) {
        query = query.gte("expense_date", filters.date_from);
      }
      if (filters.date_to) {
        query = query.lte("expense_date", filters.date_to);
      }
    }

    // Apply pagination
    if (limit) {
      query = query.limit(limit);
    }
    if (offset) {
      query = query.range(offset, offset + (limit || 50) - 1);
    }

    const { data, error } = await query;

    if (error) {
      return { data: null, error: handleSupabaseError(error) };
    }

    // Fetch involved profiles for each expense
    const expensesWithDetails = await Promise.all(
      (data || []).map(async (expense) => {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, name")
          .in("id", expense.involved_profile_ids);

        return {
          ...expense,
          involved_profiles: profiles || [],
        };
      })
    );

    return { data: expensesWithDetails, error: null };
  } catch (error) {
    return { data: null, error: handleSupabaseError(error) };
  }
};

// Update an existing expense record by its id
export const updateExpense = async (
  expenseId: string,
  updates: ExpenseUpdate
): Promise<DatabaseResponse<Expense>> => {
  try {
    // Verify that the current user is authorized to update this expense
    const currentUserId = await getCurrentUserId();
    if (!currentUserId) {
      return {
        data: null,
        error: new Error("No authenticated user found"),
      };
    }

    // Check if user is involved in the expense
    const { data: existingExpense, error: fetchError } = await supabase
      .from("expenses")
      .select("involved_profile_ids, paid_by_profile_id")
      .eq("id", expenseId)
      .single();

    if (fetchError) {
      return { data: null, error: handleSupabaseError(fetchError) };
    }

    if (
      !existingExpense.involved_profile_ids.includes(currentUserId) &&
      existingExpense.paid_by_profile_id !== currentUserId
    ) {
      return {
        data: null,
        error: new Error(
          "Unauthorized: You can only update expenses you are involved in"
        ),
      };
    }

    const { data, error } = await supabase
      .from("expenses")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", expenseId)
      .select()
      .single();

    if (error) {
      return { data: null, error: handleSupabaseError(error) };
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error: handleSupabaseError(error) };
  }
};

// Delete an expense record by its id
export const deleteExpense = async (
  expenseId: string
): Promise<DatabaseResponse<boolean>> => {
  try {
    // Verify that the current user is authorized to delete this expense
    const currentUserId = await getCurrentUserId();
    if (!currentUserId) {
      return {
        data: null,
        error: new Error("No authenticated user found"),
      };
    }

    // Check if user is involved in the expense
    const { data: existingExpense, error: fetchError } = await supabase
      .from("expenses")
      .select("involved_profile_ids, paid_by_profile_id")
      .eq("id", expenseId)
      .single();

    if (fetchError) {
      return { data: null, error: handleSupabaseError(fetchError) };
    }

    if (
      !existingExpense.involved_profile_ids.includes(currentUserId) &&
      existingExpense.paid_by_profile_id !== currentUserId
    ) {
      return {
        data: null,
        error: new Error(
          "Unauthorized: You can only delete expenses you are involved in"
        ),
      };
    }

    const { error } = await supabase
      .from("expenses")
      .delete()
      .eq("id", expenseId);

    if (error) {
      return { data: null, error: handleSupabaseError(error) };
    }

    return { data: true, error: null };
  } catch (error) {
    return { data: null, error: handleSupabaseError(error) };
  }
};

// Get a specific expense by ID with details
export const fetchExpenseById = async (
  expenseId: string
): Promise<DatabaseResponse<ExpenseWithDetails>> => {
  try {
    const { data, error } = await supabase
      .from("expenses")
      .select(
        `
        *,
        category:categories(id, name, icon),
        paid_by_profile:profiles!paid_by_profile_id(id, name),
        group:groups(id, name, owner_id)
      `
      )
      .eq("id", expenseId)
      .single();

    if (error) {
      return { data: null, error: handleSupabaseError(error) };
    }

    // Fetch involved profiles
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, name")
      .in("id", data.involved_profile_ids);

    const expenseWithDetails = {
      ...data,
      involved_profiles: profiles || [],
    };

    return { data: expenseWithDetails, error: null };
  } catch (error) {
    return { data: null, error: handleSupabaseError(error) };
  }
};

// Calculate split amounts based on split details
export const calculateSplitAmounts = (
  totalAmount: number,
  splitDetails: SplitDetails
): { profile_id: string; amount: number }[] => {
  switch (splitDetails.type) {
    case "equal":
      const equalAmount = totalAmount / splitDetails.participants.length;
      return splitDetails.participants.map((p) => ({
        profile_id: p.profile_id,
        amount: Math.round(equalAmount * 100) / 100, // Round to 2 decimal places
      }));

    case "percentage":
      return splitDetails.participants.map((p) => ({
        profile_id: p.profile_id,
        amount:
          Math.round(((totalAmount * (p.percentage || 0)) / 100) * 100) / 100,
      }));

    case "custom":
      return splitDetails.participants.map((p) => ({
        profile_id: p.profile_id,
        amount: p.amount,
      }));

    default:
      return [];
  }
};

// Helper function to create expense with automatic split calculation
export const addExpenseWithSplit = async (
  expenseData: Omit<ExpenseInsert, "split_details">,
  splitType: "equal" | "percentage" | "custom",
  splitConfig?: {
    percentages?: { profile_id: string; percentage: number }[];
    customAmounts?: { profile_id: string; amount: number }[];
  }
): Promise<DatabaseResponse<Expense>> => {
  try {
    let splitDetails: SplitDetails;

    switch (splitType) {
      case "equal":
        splitDetails = {
          type: "equal",
          participants: expenseData.involved_profile_ids.map((id) => ({
            profile_id: id,
            amount:
              Math.round(
                (expenseData.amount / expenseData.involved_profile_ids.length) *
                  100
              ) / 100,
          })),
        };
        break;

      case "percentage":
        if (!splitConfig?.percentages) {
          return {
            data: null,
            error: new Error(
              "Percentage configuration required for percentage split"
            ),
          };
        }
        splitDetails = {
          type: "percentage",
          participants: splitConfig.percentages.map((p) => ({
            profile_id: p.profile_id,
            amount:
              Math.round(((expenseData.amount * p.percentage) / 100) * 100) /
              100,
            percentage: p.percentage,
          })),
        };
        break;

      case "custom":
        if (!splitConfig?.customAmounts) {
          return {
            data: null,
            error: new Error(
              "Custom amounts configuration required for custom split"
            ),
          };
        }
        splitDetails = {
          type: "custom",
          participants: splitConfig.customAmounts.map((p) => ({
            profile_id: p.profile_id,
            amount: p.amount,
          })),
        };
        break;

      default:
        return { data: null, error: new Error("Invalid split type") };
    }

    const expenseWithSplit: ExpenseInsert = {
      ...expenseData,
      split_details: splitDetails,
    };

    return addExpense(expenseWithSplit);
  } catch (error) {
    return { data: null, error: handleSupabaseError(error) };
  }
};

// Get expense statistics for a user
export const getExpenseStats = async (
  userId: string,
  dateRange?: DateRange,
  groupId?: string
): Promise<DatabaseResponse<ExpenseStats>> => {
  try {
    const filters: ExpenseFilters = {};

    if (dateRange) {
      filters.date_from = dateRange.start;
      filters.date_to = dateRange.end;
    }

    const { data: expenses } = await fetchExpenses(userId, groupId, filters);
    if (!expenses) {
      return {
        data: null,
        error: new Error("Could not fetch expenses for statistics"),
      };
    }

    const totalAmount = expenses.reduce(
      (sum, expense) => sum + expense.amount,
      0
    );
    const expenseCount = expenses.length;
    const averageAmount = expenseCount > 0 ? totalAmount / expenseCount : 0;

    // Get category breakdown
    const categoryBreakdown = expenses.reduce((acc, expense) => {
      const categoryId = expense.category_id || "uncategorized";
      const categoryName = expense.category?.name || "Uncategorized";

      if (!acc[categoryId]) {
        acc[categoryId] = {
          category_id: categoryId,
          category_name: categoryName,
          total_amount: 0,
          expense_count: 0,
        };
      }

      acc[categoryId].total_amount += expense.amount;
      acc[categoryId].expense_count += 1;

      return acc;
    }, {} as Record<string, any>);

    // Get monthly totals
    const monthlyTotals = expenses.reduce((acc, expense) => {
      const month = new Date(expense.expense_date)
        .toISOString()
        .substring(0, 7); // YYYY-MM

      if (!acc[month]) {
        acc[month] = {
          month,
          total_amount: 0,
          expense_count: 0,
        };
      }

      acc[month].total_amount += expense.amount;
      acc[month].expense_count += 1;

      return acc;
    }, {} as Record<string, any>);

    const stats: ExpenseStats = {
      total_amount: totalAmount,
      expense_count: expenseCount,
      average_amount: averageAmount,
      category_breakdown: Object.values(categoryBreakdown),
      monthly_totals: Object.values(monthlyTotals).sort((a, b) =>
        a.month.localeCompare(b.month)
      ),
    };

    return { data: stats, error: null };
  } catch (error) {
    return { data: null, error: handleSupabaseError(error) };
  }
};

// Get recent expenses for current user
export const getRecentExpenses = async (
  days: number = 30,
  limit: number = 50
): Promise<DatabaseListResponse<ExpenseWithDetails>> => {
  try {
    const currentUserId = await getCurrentUserId();
    if (!currentUserId) {
      return {
        data: null,
        error: new Error("No authenticated user found"),
      };
    }

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const filters: ExpenseFilters = {
      date_from: startDate.toISOString(),
      date_to: endDate.toISOString(),
    };

    return fetchExpenses(currentUserId, null, filters, limit);
  } catch (error) {
    return { data: null, error: handleSupabaseError(error) };
  }
};

// Subscribe to real-time expense changes
export const subscribeToExpenses = (
  callback: (payload: any) => void,
  userId?: string
) => {
  let channel = supabase.channel("expenses-changes").on(
    "postgres_changes",
    {
      event: "*",
      schema: "public",
      table: "expenses",
      // Optional: filter by user involvement
      filter: userId ? `involved_profile_ids.cs.{${userId}}` : undefined,
    },
    callback
  );

  return channel.subscribe();
};

// Unsubscribe from real-time changes
export const unsubscribeFromExpenses = (subscription: any) => {
  return supabase.removeChannel(subscription);
};
