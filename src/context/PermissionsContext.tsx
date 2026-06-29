"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';

type PermissionKey = 'data:edit' | 'data:upload' | 'users:manage' | 'roles:manage' | 'db:fetch';

interface PermissionsContextType {
  permissions: string[];
  hasPermission: (key: PermissionKey) => boolean;
  loading: boolean;
}

const PermissionsContext = createContext<PermissionsContextType>({
  permissions: [],
  hasPermission: () => false,
  loading: true,
});

export const PermissionsProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: session, status } = useSession();
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const userRole = (session?.user as any)?.role;

  useEffect(() => {
    const fetchPermissions = async () => {
      if (status === 'loading') return;
      
      if (!userRole) {
        setPermissions([]);
        setLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/admin/roles');
        if (res.ok) {
          const data = await res.json();
          const roleData = data.roles.find((r: any) => r.role === userRole);
          if (roleData) {
            setPermissions(JSON.parse(roleData.permissions));
          } else {
            // Defaults fallback
            if (userRole === 'admin') setPermissions(['data:edit', 'data:upload', 'users:manage', 'roles:manage', 'db:fetch']);
            else if (userRole === 'user') setPermissions(['data:edit', 'db:fetch']);
            else if (userRole === 'guest') setPermissions(['db:fetch']);
            else setPermissions([]);
          }
        }
      } catch (err) {
        console.error('Failed to fetch permissions', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPermissions();
  }, [userRole, status]);

  const hasPermission = useCallback((key: PermissionKey) => {
    return permissions.includes(key);
  }, [permissions]);

  return (
    <PermissionsContext.Provider value={{ permissions, hasPermission, loading }}>
      {children}
    </PermissionsContext.Provider>
  );
};

export const usePermissions = () => useContext(PermissionsContext);
