import {
  getCurrentUserId,
  handleSupabaseError,
  supabase,
} from "@/lib/supabase";
import {
  DatabaseListResponse,
  DatabaseResponse,
  Group,
  GroupInsert,
  GroupMember,
  GroupMemberInsert,
  GroupUpdate,
  GroupWithMembers,
  Profile,
} from "@/types/database";

// Create a new expense group
export const createGroup = async (
  name: string,
  ownerId: string
): Promise<DatabaseResponse<Group>> => {
  try {
    // Verify that the owner is the current user
    const currentUserId = await getCurrentUserId();
    if (!currentUserId || currentUserId !== ownerId) {
      return {
        data: null,
        error: new Error("Unauthorized: Can only create groups as yourself"),
      };
    }

    const groupData: GroupInsert = {
      name,
      owner_id: ownerId,
    };

    const { data, error } = await supabase
      .from("groups")
      .insert(groupData)
      .select()
      .single();

    if (error) {
      return { data: null, error: handleSupabaseError(error) };
    }

    // Automatically add the owner as a member
    if (data) {
      await addGroupMember(data.id, ownerId);
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error: handleSupabaseError(error) };
  }
};

// Fetch all groups that a given userId is a member of
export const fetchGroups = async (
  userId: string
): Promise<DatabaseListResponse<GroupWithMembers>> => {
  try {
    const { data, error } = await supabase
      .from("groups")
      .select(
        `
        *,
        group_members!inner(profile_id),
        members:group_members(
          profile:profiles(id, name)
        )
      `
      )
      .eq("group_members.profile_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      return { data: null, error: handleSupabaseError(error) };
    }

    // Transform the data to match GroupWithMembers interface
    const groupsWithMembers =
      data?.map((group) => ({
        ...group,
        members:
          group.members?.map((member: any) => member.profile).filter(Boolean) ||
          [],
        member_count: group.members?.length || 0,
      })) || [];

    return { data: groupsWithMembers, error: null };
  } catch (error) {
    return { data: null, error: handleSupabaseError(error) };
  }
};

// Update an existing group's details
export const updateGroup = async (
  groupId: string,
  updates: GroupUpdate
): Promise<DatabaseResponse<Group>> => {
  try {
    // Verify that the current user is the owner of the group
    const currentUserId = await getCurrentUserId();
    if (!currentUserId) {
      return {
        data: null,
        error: new Error("No authenticated user found"),
      };
    }

    // Check if user is the owner
    const { data: group, error: fetchError } = await supabase
      .from("groups")
      .select("owner_id")
      .eq("id", groupId)
      .single();

    if (fetchError) {
      return { data: null, error: handleSupabaseError(fetchError) };
    }

    if (group.owner_id !== currentUserId) {
      return {
        data: null,
        error: new Error("Unauthorized: Only group owner can update group"),
      };
    }

    const { data, error } = await supabase
      .from("groups")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", groupId)
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

// Delete a group
export const deleteGroup = async (
  groupId: string
): Promise<DatabaseResponse<boolean>> => {
  try {
    // Verify that the current user is the owner of the group
    const currentUserId = await getCurrentUserId();
    if (!currentUserId) {
      return {
        data: null,
        error: new Error("No authenticated user found"),
      };
    }

    // Check if user is the owner
    const { data: group, error: fetchError } = await supabase
      .from("groups")
      .select("owner_id")
      .eq("id", groupId)
      .single();

    if (fetchError) {
      return { data: null, error: handleSupabaseError(fetchError) };
    }

    if (group.owner_id !== currentUserId) {
      return {
        data: null,
        error: new Error("Unauthorized: Only group owner can delete group"),
      };
    }

    const { error } = await supabase.from("groups").delete().eq("id", groupId);

    if (error) {
      return { data: null, error: handleSupabaseError(error) };
    }

    return { data: true, error: null };
  } catch (error) {
    return { data: null, error: handleSupabaseError(error) };
  }
};

// Add a profile to a specified group
export const addGroupMember = async (
  groupId: string,
  profileId: string
): Promise<DatabaseResponse<GroupMember>> => {
  try {
    // Verify that the current user is the owner of the group or adding themselves
    const currentUserId = await getCurrentUserId();
    if (!currentUserId) {
      return {
        data: null,
        error: new Error("No authenticated user found"),
      };
    }

    // Check if user is the owner or adding themselves
    const { data: group, error: fetchError } = await supabase
      .from("groups")
      .select("owner_id")
      .eq("id", groupId)
      .single();

    if (fetchError) {
      return { data: null, error: handleSupabaseError(fetchError) };
    }

    if (group.owner_id !== currentUserId && profileId !== currentUserId) {
      return {
        data: null,
        error: new Error(
          "Unauthorized: Only group owner can add other members"
        ),
      };
    }

    const memberData: GroupMemberInsert = {
      group_id: groupId,
      profile_id: profileId,
    };

    const { data, error } = await supabase
      .from("group_members")
      .insert(memberData)
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

// Remove a profile from a specified group
export const removeGroupMember = async (
  groupId: string,
  profileId: string
): Promise<DatabaseResponse<boolean>> => {
  try {
    // Verify that the current user is the owner of the group or removing themselves
    const currentUserId = await getCurrentUserId();
    if (!currentUserId) {
      return {
        data: null,
        error: new Error("No authenticated user found"),
      };
    }

    // Check if user is the owner or removing themselves
    const { data: group, error: fetchError } = await supabase
      .from("groups")
      .select("owner_id")
      .eq("id", groupId)
      .single();

    if (fetchError) {
      return { data: null, error: handleSupabaseError(fetchError) };
    }

    if (group.owner_id !== currentUserId && profileId !== currentUserId) {
      return {
        data: null,
        error: new Error(
          "Unauthorized: Only group owner can remove other members"
        ),
      };
    }

    // Prevent owner from removing themselves if they're the only member
    if (group.owner_id === profileId) {
      const { data: memberCount } = await supabase
        .from("group_members")
        .select("id", { count: "exact" })
        .eq("group_id", groupId);

      if (memberCount && memberCount.length <= 1) {
        return {
          data: null,
          error: new Error(
            "Cannot remove group owner when they are the only member. Delete the group instead."
          ),
        };
      }
    }

    const { error } = await supabase
      .from("group_members")
      .delete()
      .eq("group_id", groupId)
      .eq("profile_id", profileId);

    if (error) {
      return { data: null, error: handleSupabaseError(error) };
    }

    return { data: true, error: null };
  } catch (error) {
    return { data: null, error: handleSupabaseError(error) };
  }
};

// Fetch all profiles belonging to a specific group
export const fetchGroupMembers = async (
  groupId: string
): Promise<DatabaseListResponse<Profile>> => {
  try {
    const { data, error } = await supabase
      .from("group_members")
      .select(
        `
        profile:profiles(id, name, created_at)
      `
      )
      .eq("group_id", groupId);

    if (error) {
      return { data: null, error: handleSupabaseError(error) };
    }

    const members =
      data?.map((member: any) => member.profile).filter(Boolean) || [];

    return { data: members, error: null };
  } catch (error) {
    return { data: null, error: handleSupabaseError(error) };
  }
};

// Get a specific group by ID with members
export const fetchGroupById = async (
  groupId: string
): Promise<DatabaseResponse<GroupWithMembers>> => {
  try {
    const { data, error } = await supabase
      .from("groups")
      .select(
        `
        *,
        members:group_members(
          profile:profiles(id, name, created_at)
        )
      `
      )
      .eq("id", groupId)
      .single();

    if (error) {
      return { data: null, error: handleSupabaseError(error) };
    }

    // Transform the data to match GroupWithMembers interface
    const groupWithMembers = {
      ...data,
      members:
        data.members?.map((member: any) => member.profile).filter(Boolean) ||
        [],
      member_count: data.members?.length || 0,
    };

    return { data: groupWithMembers, error: null };
  } catch (error) {
    return { data: null, error: handleSupabaseError(error) };
  }
};

// Check if a user is a member of a specific group
export const isGroupMember = async (
  groupId: string,
  profileId: string
): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from("group_members")
      .select("id")
      .eq("group_id", groupId)
      .eq("profile_id", profileId)
      .single();

    if (error) {
      return false;
    }

    return !!data;
  } catch (error) {
    return false;
  }
};

// Get groups owned by current user
export const fetchOwnedGroups = async (): Promise<
  DatabaseListResponse<GroupWithMembers>
> => {
  try {
    const currentUserId = await getCurrentUserId();
    if (!currentUserId) {
      return {
        data: null,
        error: new Error("No authenticated user found"),
      };
    }

    const { data, error } = await supabase
      .from("groups")
      .select(
        `
        *,
        members:group_members(
          profile:profiles(id, name, created_at)
        )
      `
      )
      .eq("owner_id", currentUserId)
      .order("created_at", { ascending: false });

    if (error) {
      return { data: null, error: handleSupabaseError(error) };
    }

    // Transform the data to match GroupWithMembers interface
    const groupsWithMembers =
      data?.map((group) => ({
        ...group,
        members:
          group.members?.map((member: any) => member.profile).filter(Boolean) ||
          [],
        member_count: group.members?.length || 0,
      })) || [];

    return { data: groupsWithMembers, error: null };
  } catch (error) {
    return { data: null, error: handleSupabaseError(error) };
  }
};
