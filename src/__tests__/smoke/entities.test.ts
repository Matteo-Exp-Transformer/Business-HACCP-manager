import { describe, it, expect } from "vitest";
import { useDataStore } from "../../store/dataStore";

describe("entities mutations", () => {
  it("add/update/remove conservation point", () => {
    const id = "cp-1";
    useDataStore.getState().addEntity("conservationPoints", { id, label: "Frigo A", range: {min:0,max:4} });
    expect(useDataStore.getState().entities.conservationPoints[id]).toBeTruthy();

    useDataStore.getState().updateEntity("conservationPoints", id, { label: "Frigo A1" });
    expect(useDataStore.getState().entities.conservationPoints[id].label).toBe("Frigo A1");

    useDataStore.getState().removeEntity("conservationPoints", id);
    expect(useDataStore.getState().entities.conservationPoints[id]).toBeUndefined();
  });
});
