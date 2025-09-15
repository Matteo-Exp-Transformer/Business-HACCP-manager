import React from "react";
import { useDataStore } from "../../store/dataStore";

type Props = { entity: string; children: React.ReactNode; };

export default function FormGate({ entity, children }: Props) {
  const forms = useDataStore(s => s.meta.forms);
  const f = forms[entity];
  const blocked = f && f.mode !== "idle";

  if (blocked) {
    return <div className="text-sm p-2 rounded border">
      Hai già un form aperto per {entity}. Chiudi quello prima di aprirne un altro.
    </div>;
  }
  return <>{children}</>;
}