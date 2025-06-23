import { handleSupabaseError, supabase } from "@/lib/supabase";
import {
  Category,
  CategoryInsert,
  DatabaseListResponse,
  DatabaseResponse,
} from "@/types/database";

// Retrieve all predefined expense categories
export const fetchCategories = async (): Promise<
  DatabaseListResponse<Category>
> => {
  try {
    const { data, error } = await supabase.from("categories").select("*");

    if (error) {
      return { data: null, error: handleSupabaseError(error) };
    }

    return { data: data || [], error: null };
  } catch (error) {
    return { data: null, error: handleSupabaseError(error) };
  }
};

// Insert a new category
export const addCategory = async (
  id: string,
  name: string,
  icon?: string
): Promise<DatabaseResponse<Category>> => {
  try {
    const categoryData: CategoryInsert = {
      id,
      name,
      icon,
    };

    const { data, error } = await supabase
      .from("categories")
      .insert(categoryData)
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

// Get a specific category by ID
export const fetchCategoryById = async (
  id: string
): Promise<DatabaseResponse<Category>> => {
  try {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      return { data: null, error: handleSupabaseError(error) };
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error: handleSupabaseError(error) };
  }
};

// Update an existing category
export const updateCategory = async (
  id: string,
  name: string,
  icon?: string
): Promise<DatabaseResponse<Category>> => {
  try {
    const { data, error } = await supabase
      .from("categories")
      .update({ name, icon })
      .eq("id", id)
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

// Delete a category
export const deleteCategory = async (
  id: string
): Promise<DatabaseResponse<boolean>> => {
  try {
    const { error } = await supabase.from("categories").delete().eq("id", id);

    if (error) {
      return { data: null, error: handleSupabaseError(error) };
    }

    return { data: true, error: null };
  } catch (error) {
    return { data: null, error: handleSupabaseError(error) };
  }
};

// Initialize default categories if they don't exist
export const initializeDefaultCategories = async (): Promise<
  DatabaseResponse<Category[]>
> => {
  try {
    const defaultCategories: CategoryInsert[] = [
      { id: "food", name: "Food & Dining", icon: "🍽️" },
      { id: "transport", name: "Transportation", icon: "🚗" },
      { id: "home", name: "Home & Utilities", icon: "🏠" },
      { id: "entertainment", name: "Entertainment", icon: "🎬" },
      { id: "shopping", name: "Shopping", icon: "🛍️" },
      { id: "health", name: "Health & Fitness", icon: "🏥" },
      { id: "travel", name: "Travel", icon: "✈️" },
      { id: "education", name: "Education", icon: "📚" },
      { id: "other", name: "Other", icon: "📦" },
    ];

    // Check which categories already exist
    const { data: existingCategories, error: fetchError } = await supabase
      .from("categories")
      .select("id")
      .in(
        "id",
        defaultCategories.map((c) => c.id)
      );

    if (fetchError) {
      return { data: null, error: handleSupabaseError(fetchError) };
    }

    const existingIds = existingCategories?.map((c) => c.id) || [];
    const categoriesToCreate = defaultCategories.filter(
      (c) => !existingIds.includes(c.id)
    );

    if (categoriesToCreate.length === 0) {
      // All categories already exist, return existing ones
      const { data: allCategories, error: allError } = await fetchCategories();
      if (allError) {
        return { data: null, error: allError };
      }
      return { data: allCategories || [], error: null };
    }

    // Create missing categories
    const { data: newCategories, error: createError } = await supabase
      .from("categories")
      .insert(categoriesToCreate)
      .select();

    if (createError) {
      return { data: null, error: handleSupabaseError(createError) };
    }

    // Return all categories
    const { data: allCategories, error: allError } = await fetchCategories();
    if (allError) {
      return { data: null, error: allError };
    }

    return { data: allCategories || [], error: null };
  } catch (error) {
    return { data: null, error: handleSupabaseError(error) };
  }
};

// Get categories with expense count for each category
export const fetchCategoriesWithExpenseCount = async (): Promise<
  DatabaseResponse<Array<Category & { expense_count: number }>>
> => {
  try {
    const { data, error } = await supabase.from("categories").select(`
        *,
        expenses(count)
      `);

    if (error) {
      return { data: null, error: handleSupabaseError(error) };
    }

    // Transform the data to include expense count
    const categoriesWithCount =
      data?.map((category) => ({
        ...category,
        expense_count: category.expenses?.[0]?.count || 0,
      })) || [];

    return { data: categoriesWithCount, error: null };
  } catch (error) {
    return { data: null, error: handleSupabaseError(error) };
  }
};

// Check if categories are initialized
export const areCategoriesInitialized = async (): Promise<boolean> => {
  try {
    const { data } = await fetchCategories();
    return !!(data && data.length > 0);
  } catch (error) {
    console.error("Error checking if categories are initialized:", error);
    return false;
  }
};
