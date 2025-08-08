import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useValidatedTranslation } from "@/hooks/useValidatedTranslation";
import CharityService from "@/services/charityService";
import { Button, Input, Checkbox, Typography } from "@material-tailwind/react";
import { toast } from "react-toastify";

const emptyForm = {
  name: "",
  slug: "",
  description: "",
  website_url: "",
  logo_url: "",
  is_enabled: false,
  sort_order: 0,
};

const CharitiesAdminPage = () => {
  const { t } = useValidatedTranslation();
  const { user } = useSelector((s) => s.auth);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(null); // id or null for create
  const [form, setForm] = useState(emptyForm);

  const isAdmin = user?.role === "admin";

  const load = async () => {
    try {
      setLoading(true);
      const res = await CharityService.listAll();
      if (!res.success) throw new Error(res.message || "Failed to load charities");
      setItems(res.data || []);
    } catch (e) {
      toast.error(e.message || "Failed to load charities");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) load();
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <div className="p-6">
        <Typography variant="h5">Admin access required</Typography>
      </div>
    );
  }

  const startCreate = () => {
    setEditing("new");
    setForm(emptyForm);
  };

  const startEdit = (it) => {
    setEditing(it._id);
    setForm({
      name: it.name || "",
      slug: it.slug || "",
      description: it.description || "",
      website_url: it.website_url || "",
      logo_url: it.logo_url || "",
      is_enabled: !!it.is_enabled,
      sort_order: it.sort_order ?? 0,
    });
  };

  const cancelEdit = () => {
    setEditing(null);
    setForm(emptyForm);
  };

  const save = async () => {
    try {
      const payload = { ...form };
      const res =
        editing === "new"
          ? await CharityService.create(payload)
          : await CharityService.update(editing, payload);
      if (!res.success) throw new Error(res.message || "Failed to save");
      toast.success("Saved");
      cancelEdit();
      await load();
    } catch (e) {
      toast.error(e.message || "Failed to save");
    }
  };

  const remove = async (id) => {
    if (!confirm("Delete this charity?")) return;
    try {
      const res = await CharityService.remove(id);
      if (!res.success) throw new Error(res.message || "Failed to delete");
      toast.success("Deleted");
      await load();
    } catch (e) {
      toast.error(e.message || "Failed to delete");
    }
  };

  const toggle = async (id) => {
    try {
      const res = await CharityService.toggle(id);
      if (!res.success) throw new Error(res.message || "Failed to toggle");
      await load();
    } catch (e) {
      toast.error(e.message || "Failed to toggle");
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <Typography variant="h4">Charities</Typography>
        <Button onClick={startCreate} color="green">
          + Create Charity
        </Button>
      </div>

      {/* List */}
      <div className="space-y-3">
        {items.map((it) => (
          <div key={it._id} className="p-3 border rounded flex items-center gap-3">
            {it.logo_url ? (
              <img src={it.logo_url} alt={it.name} className="h-10 w-10 object-contain" />
            ) : (
              <div className="h-10 w-10 bg-gray-200 rounded" />
            )}
            <div className="flex-1">
              <div className="font-semibold">{it.name}</div>
              <div className="text-sm text-gray-600 line-clamp-1">{it.description}</div>
              <div className="text-xs text-gray-500">slug: {it.slug} · order: {it.sort_order}</div>
            </div>
            <Checkbox
              checked={!!it.is_enabled}
              onChange={() => toggle(it._id)}
              label="Enabled"
            />
            <div className="flex gap-2">
              <Button size="sm" variant="outlined" onClick={() => startEdit(it)}>
                Edit
              </Button>
              <Button size="sm" color="red" onClick={() => remove(it._id)}>
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Editor */}
      {editing && (
        <div className="mt-6 p-4 border rounded">
          <Typography variant="h5" className="mb-4">
            {editing === "new" ? "Create Charity" : "Edit Charity"}
          </Typography>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Input label="Slug (optional)" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
            <Input label="Website URL" value={form.website_url} onChange={(e) => setForm({ ...form, website_url: e.target.value })} />
            <Input label="Logo URL" value={form.logo_url} onChange={(e) => setForm({ ...form, logo_url: e.target.value })} />
            <Input label="Sort Order" type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} />
            <div className="flex items-center">
              <Checkbox checked={form.is_enabled} onChange={(e) => setForm({ ...form, is_enabled: e.target.checked })} label="Enabled" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                className="w-full border rounded p-2 min-h-24"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <Button onClick={save} color="green">Save</Button>
            <Button variant="outlined" onClick={cancelEdit}>Cancel</Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CharitiesAdminPage;

