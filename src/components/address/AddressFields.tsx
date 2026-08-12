"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, MapPin } from "lucide-react";
import { Input } from "@/components/ui/Input";
import {
  INDIAN_STATES,
  PINCODE_PATTERN,
  MOBILE_PATTERN,
  digitsOnly,
} from "@/lib/india";

export interface AddressValue {
  fullName: string;
  phone: string;
  postalCode: string;
  line1: string;
  line2: string;
  landmark: string;
  city: string;
  state: string;
}

interface AddressFieldsProps {
  value: AddressValue;
  onChange: (patch: Partial<AddressValue>) => void;
  /** Field order follows Amazon/Flipkart: PIN first, then it fills the rest. */
  idPrefix?: string;
}

export function AddressFields({
  value,
  onChange,
  idPrefix = "addr",
}: AddressFieldsProps) {
  const [looking, setLooking] = useState(false);
  const [pinNote, setPinNote] = useState<string | null>(null);
  const [localities, setLocalities] = useState<string[]>([]);
  const lastPin = useRef("");

  const pin = value.postalCode;

  useEffect(() => {
    if (!PINCODE_PATTERN.test(pin)) {
      setLocalities([]);
      setPinNote(null);
      lastPin.current = "";
      return;
    }
    // Don't re-fetch the PIN we already resolved.
    if (lastPin.current === pin) return;
    lastPin.current = pin;

    const ctrl = new AbortController();
    setLooking(true);
    setPinNote(null);

    (async () => {
      try {
        const res = await fetch(`/api/pincode?pin=${pin}`, {
          signal: ctrl.signal,
        });
        const data = await res.json();

        if (!res.ok || !data.found) {
          setLocalities([]);
          setPinNote(
            data.error ?? "We couldn't find that PIN code — enter your city below."
          );
          return;
        }

        setLocalities(data.localities ?? []);
        // Fill city/state from the PIN, as Amazon does.
        onChange({
          state: data.state || value.state,
          city: data.district || value.city,
        });
        setPinNote(`${data.district}, ${data.state}`);
      } catch (e) {
        if ((e as Error).name !== "AbortError") {
          setPinNote("Couldn't check that PIN code — enter your city below.");
        }
      } finally {
        setLooking(false);
      }
    })();

    return () => ctrl.abort();
    // onChange/value are intentionally excluded: this should run on PIN change only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pin]);

  const phoneInvalid =
    value.phone.length > 0 && !MOBILE_PATTERN.test(digitsOnly(value.phone));

  return (
    <div className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Input
          id={`${idPrefix}-name`}
          label="Full name"
          autoComplete="name"
          value={value.fullName}
          onChange={(e) => onChange({ fullName: e.target.value })}
          placeholder="Name of the person receiving it"
        />
        <Input
          id={`${idPrefix}-phone`}
          label="Mobile number"
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          maxLength={10}
          value={value.phone}
          onChange={(e) => onChange({ phone: digitsOnly(e.target.value).slice(0, 10) })}
          placeholder="10-digit mobile number"
          error={phoneInvalid ? "Enter a valid 10-digit mobile number" : undefined}
        />
      </div>

      <div>
        <Input
          id={`${idPrefix}-pin`}
          label="PIN code"
          inputMode="numeric"
          autoComplete="postal-code"
          maxLength={6}
          value={value.postalCode}
          onChange={(e) =>
            onChange({ postalCode: digitsOnly(e.target.value).slice(0, 6) })
          }
          placeholder="6-digit PIN code"
        />
        {looking && (
          <p className="mt-1.5 flex items-center gap-1.5 text-xs text-izhaana-charcoal/55">
            <Loader2 size={12} className="animate-spin" />
            Looking up your area…
          </p>
        )}
        {!looking && pinNote && (
          <p className="mt-1.5 flex items-center gap-1.5 text-xs text-izhaana-charcoal/55">
            <MapPin size={12} />
            {pinNote}
          </p>
        )}
      </div>

      <Input
        id={`${idPrefix}-line1`}
        label="Flat, house no., building"
        autoComplete="address-line1"
        value={value.line1}
        onChange={(e) => onChange({ line1: e.target.value })}
      />

      {/* A datalist rather than a <select>: suggests the areas India Post lists
          for this PIN, but never blocks someone whose locality isn't in it. */}
      <div>
        <Input
          id={`${idPrefix}-line2`}
          label="Area, street, sector"
          autoComplete="address-line2"
          list={localities.length > 0 ? `${idPrefix}-localities` : undefined}
          value={value.line2}
          onChange={(e) => onChange({ line2: e.target.value })}
          placeholder={
            localities.length > 0 ? "Start typing or pick your area" : undefined
          }
        />
        {localities.length > 0 && (
          <>
            <datalist id={`${idPrefix}-localities`}>
              {localities.map((l) => (
                <option key={l} value={l} />
              ))}
            </datalist>
            <p className="mt-1.5 text-xs text-izhaana-charcoal/45">
              {localities.length} areas listed for PIN {value.postalCode}
            </p>
          </>
        )}
      </div>

      <Input
        id={`${idPrefix}-landmark`}
        label="Landmark (optional)"
        value={value.landmark}
        onChange={(e) => onChange({ landmark: e.target.value })}
        placeholder="e.g. Rajwada Palace"
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <Input
          id={`${idPrefix}-city`}
          label="Town / city"
          autoComplete="address-level2"
          value={value.city}
          onChange={(e) => onChange({ city: e.target.value })}
        />
        <div className="space-y-1.5">
          <label htmlFor={`${idPrefix}-state`} className="block text-sm font-medium">
            State
          </label>
          <select
            id={`${idPrefix}-state`}
            value={value.state}
            onChange={(e) => onChange({ state: e.target.value })}
            className="w-full border border-izhaana-charcoal/20 bg-white px-4 py-2.5 text-sm focus:border-izhaana-burgundy focus:outline-none"
          >
            <option value="">Select a state…</option>
            {INDIAN_STATES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
