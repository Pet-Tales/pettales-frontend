import { useState, useEffect } from "react";
import { Dialog, DialogHeader, DialogBody, DialogFooter, Button, Typography, Spinner } from "@material-tailwind/react";
import { useValidatedTranslation } from "@/hooks/useValidatedTranslation";
import logger from "@/utils/logger";

const CharitySelectionModal = ({ open, onClose, onConfirm, bookId }) => {
  const { t } = useValidatedTranslation();
  const [charities, setCharities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open) return;
    const fetchCharities = async () => {
      try {
        setLoading(true);
        setError(null);
        const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8080";
        const res = await fetch(`${baseUrl}/api/charities`, { credentials: "include" });
        const json = await res.json();
        if (!json.success) throw new Error(json.message || "Failed to load charities");
        setCharities(json.data || []);
      } catch (e) {
        logger.error("Failed to load charities", e);
        setError(t("charity.loadError"));
      } finally {
        setLoading(false);
      }
    };
    fetchCharities();
  }, [open, t]);

  const handleConfirm = () => {
    if (!selected) {
      setError(t("charity.required"));
      return;
    }
    onConfirm(selected);
  };

  return (
    <Dialog open={open} handler={onClose} size="md">
      <DialogHeader>
        <Typography variant="h5">{t("charity.selectTitle")}</Typography>
      </DialogHeader>
      <DialogBody>
        {loading ? (
          <div className="flex items-center justify-center py-6">
            <Spinner />
          </div>
        ) : error ? (
          <Typography color="red">{error}</Typography>
        ) : charities.length === 0 ? (
          <Typography>{t("charity.noneAvailable")}</Typography>
        ) : (
          <div className="flex flex-col gap-3">
            {charities.map((c) => (
              <label key={c.id} className="flex items-center gap-3 p-3 border rounded hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  name="charity"
                  value={c.id}
                  checked={selected === c.id}
                  onChange={() => setSelected(c.id)}
                />
                {c.logoUrl ? (
                  <img src={c.logoUrl} alt={c.name} className="h-8 w-8 object-contain" />
                ) : (
                  <div className="h-8 w-8 bg-gray-200 rounded" />
                )}
                <div className="flex-1">
                  <Typography className="font-semibold">{c.name}</Typography>
                  {c.description && (
                    <Typography variant="small" className="text-gray-600 line-clamp-2">
                      {c.description}
                    </Typography>
                  )}
                </div>
              </label>
            ))}
          </div>
        )}
      </DialogBody>
      <DialogFooter className="gap-2">
        <Button variant="text" color="gray" onClick={onClose}>
          {t("common.cancel")}
        </Button>
        <Button variant="filled" color="green" onClick={handleConfirm} disabled={!selected}>
          {t("charity.confirmButton")}
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default CharitySelectionModal;

