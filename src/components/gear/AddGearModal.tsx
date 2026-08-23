"use client";

import { useState, useTransition } from "react";
import { addGear } from "@/app/(main)/settings/actions";
import { useToast } from "@/components/Toast";
import type { GearCategory } from "@/generated/prisma/client";
import {
  GEAR_BRAND_LIST,
  GEAR_CATEGORY_LABEL,
  GEAR_CATEGORY_ORDER,
  GEAR_PRODUCT_CATALOG,
  isBrandOnlyCategory,
  isCatalogCategory,
  OTHER_BRAND as OTHER,
} from "@/lib/gear";

const inputCls =
  "w-full rounded border border-zinc-300 bg-white px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900";

const CURRENT_YEAR = new Date().getFullYear();
const PURCHASE_YEARS = Array.from({ length: 21 }, (_, i) => CURRENT_YEAR - i);

export function AddGearModal() {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [category, setCategory] = useState<GearCategory>("SHOE");
  const [brandChoice, setBrandChoice] = useState("");
  const [model, setModel] = useState("");
  const [error, setError] = useState<string | null>(null);
  const showToast = useToast();

  const catalog = isCatalogCategory(category) ? GEAR_PRODUCT_CATALOG[category] : null;
  const brandOnlyList = isBrandOnlyCategory(category) ? GEAR_BRAND_LIST[category] : null;
  const brandOptions = catalog ? Object.keys(catalog) : (brandOnlyList ?? []);
  const modelOptions = catalog && brandChoice && brandChoice !== OTHER ? (catalog[brandChoice] ?? []) : [];
  const isOtherBrand = brandChoice === OTHER;

  function resetForm() {
    setCategory("SHOE");
    setBrandChoice("");
    setModel("");
    setError(null);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);

    if (catalog || brandOnlyList) {
      const brandVal = String(formData.get("brand") ?? "").trim();
      if (!brandVal) {
        setError("Please select or enter a brand.");
        return;
      }
    }
    if (catalog) {
      const modelVal = String(formData.get("model") ?? "").trim();
      if (!modelVal) {
        setError("Please select or enter a model.");
        return;
      }
    }

    startTransition(async () => {
      await addGear(formData);
      resetForm();
      setOpen(false);
      showToast("Gear added");
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="self-start rounded bg-orange-500 px-3 py-1.5 text-sm font-medium text-white"
      >
        + Add Gear
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-md rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Add Gear</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <select
                name="category"
                required
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value as GearCategory);
                  setBrandChoice("");
                  setModel("");
                }}
                className={inputCls}
              >
                {GEAR_CATEGORY_ORDER.map((c) => (
                  <option key={c} value={c}>
                    {GEAR_CATEGORY_LABEL[c]}
                  </option>
                ))}
              </select>

              {catalog && (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      name={isOtherBrand ? undefined : "brand"}
                      required={!isOtherBrand}
                      value={brandChoice}
                      onChange={(e) => {
                        setBrandChoice(e.target.value);
                        setModel("");
                      }}
                      className={inputCls}
                    >
                      <option value="" disabled>
                        Select brand
                      </option>
                      {brandOptions.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                      <option value={OTHER}>Other</option>
                    </select>

                    {isOtherBrand ? (
                      <input name="model" placeholder="Model" required className={inputCls} />
                    ) : (
                      <select
                        name="model"
                        required
                        value={model}
                        onChange={(e) => setModel(e.target.value)}
                        disabled={!brandChoice}
                        className={inputCls}
                      >
                        <option value="" disabled>
                          {brandChoice ? "Select model" : "Pick a brand first"}
                        </option>
                        {modelOptions.map((m) => (
                          <option key={m} value={m}>
                            {m}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  {isOtherBrand && <input name="brand" placeholder="Brand name" required className={inputCls} />}
                </>
              )}

              {brandOnlyList && (
                <>
                  <select
                    name={isOtherBrand ? undefined : "brand"}
                    required={!isOtherBrand}
                    value={brandChoice}
                    onChange={(e) => setBrandChoice(e.target.value)}
                    className={inputCls}
                  >
                    <option value="" disabled>
                      Select brand
                    </option>
                    {brandOptions.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                    <option value={OTHER}>Other</option>
                  </select>

                  {isOtherBrand && <input name="brand" placeholder="Brand name" required className={inputCls} />}
                </>
              )}

              {!catalog && !brandOnlyList && (
                <div className="grid grid-cols-2 gap-2">
                  <input name="brand" placeholder="Brand" required className={inputCls} />
                  <input name="model" placeholder="Model" required className={inputCls} />
                </div>
              )}

              {catalog && (
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-zinc-500">Purchase year (optional)</span>
                  <select name="purchaseYear" defaultValue="" className={inputCls}>
                    <option value="">Not set</option>
                    {PURCHASE_YEARS.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </label>
              )}

              {error && <p className="text-sm text-rose-500">{error}</p>}

              <button
                type="submit"
                disabled={pending}
                className="mt-1 rounded bg-orange-500 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
              >
                {pending ? "Adding…" : "Add"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
