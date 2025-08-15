// useKonsulent.ts
import { useEffect, useState, useCallback } from "react";
import { personApi } from "@/api/personApi";
import type { PersonDTO, CreateKonsulentDTO } from "@/api/personApi"; // adjust path if needed

export function useKonsulent() {
  const [konsulenter, setKonsulenter] = useState<PersonDTO[]>([]);
  const [currentKonsulent, setCurrentKonsulent] = useState<PersonDTO | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper: normalize Axios/Spring error messages
  const setNiceError = (err: unknown, fallback = "Something went wrong") => {
    const msg =
      (err as any)?.response?.data?.message ||
      (err as any)?.response?.data?.error ||
      (err as Error)?.message ||
      fallback;
    setError(msg);
  };

  // List all konsulenter (role_id = 2)
  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const data = await personApi.getAllKonsulenter();
      setKonsulenter(data as PersonDTO[]);
      setError(null);
    } catch (err) {
      setNiceError(err, "Failed to load konsulenter");
    } finally {
      setLoading(false);
    }
  }, []);

  // Get konsulent by ID
  const fetchById = useCallback(async (id: number) => {
    setLoading(true);
    try {
      const data = (await personApi.getById(id)) as PersonDTO;
      setCurrentKonsulent(data);
      // keep list in sync if already present
      setKonsulenter((prev) =>
        prev.some((k) => k.id === id) ? prev.map((k) => (k.id === id ? data : k)) : prev
      );
      setError(null);
    } catch (err) {
      setNiceError(err, "Failed to load konsulent");
    } finally {
      setLoading(false);
    }
  }, []);

  // Create konsulent (requires password)
  const create = useCallback(async (payload: CreateKonsulentDTO) => {
    setLoading(true);
    try {
      const created = (await personApi.createKonsulent(payload)) as PersonDTO;
      setKonsulenter((prev) => [...prev, created]);
      setCurrentKonsulent(created);
      setError(null);
      return created;
    } catch (err) {
      setNiceError(err, "Failed to create konsulent");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update konsulent (generic person update on server; password is NOT touched here)
  const update = useCallback(async (id: number, partial: Partial<PersonDTO>) => {
    setLoading(true);
    try {
      const updated = (await personApi.update(id, partial)) as PersonDTO;
      setKonsulenter((prev) => prev.map((k) => (k.id === id ? updated : k)));
      setCurrentKonsulent((prev) => (prev?.id === id ? updated : prev));
      setError(null);
      return updated;
    } catch (err) {
      setNiceError(err, "Failed to update konsulent");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete konsulent
  const remove = useCallback(async (id: number) => {
    setLoading(true);
    try {
      await personApi.delete(id);
      setKonsulenter((prev) => prev.filter((k) => k.id !== id));
      setCurrentKonsulent((prev) => (prev?.id === id ? null : prev));
      setError(null);
    } catch (err) {
      setNiceError(err, "Failed to delete konsulent");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    await fetchAll();
  }, [fetchAll]);

  const clearError = useCallback(() => setError(null), []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return {
    // state
    konsulenter,
    currentKonsulent,
    loading,
    error,

    // actions
    fetchAll,
    fetchById,
    create,
    update,
    remove,
    refresh,
    clearError,

    // optional setters
    setKonsulenter,
    setCurrentKonsulent,
  };
}
