import { useQuery } from "@tanstack/react-query";
import { useAuth } from "./use-auth";

export interface Permission {
  id: string;
  name: string;
  description: string;
  module: string;
  action: string;
}

export function usePermissions() {
  const { user } = useAuth();
  
  const { data: userPermissions = [], isLoading } = useQuery<Permission[]>({
    queryKey: ["/api/user/permissions"],
    enabled: !!user,
  });

  const hasPermission = (permissionName: string): boolean => {
    if (!user) return false;
    
    // Admin has all permissions
    if (user.userType === "admin") return true;
    
    // Check if user has specific permission
    return userPermissions.some(permission => permission.name === permissionName);
  };

  const hasAnyPermission = (permissionNames: string[]): boolean => {
    return permissionNames.some(permission => hasPermission(permission));
  };

  const hasAllPermissions = (permissionNames: string[]): boolean => {
    return permissionNames.every(permission => hasPermission(permission));
  };

  return {
    permissions: userPermissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isLoading,
  };
}