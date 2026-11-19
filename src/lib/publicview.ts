import "server-only";
import type { MedicalData } from "./profile";
import { ageFrom } from "./profile";
import type { VisibilityMap } from "./fields";

/** Хэвлэх карт, ханын зурагт зөвхөн "Нээлттэй" мэдээллийг оруулна */
export function publicSummary(med: MedicalData, vis: VisibilityMap) {
  const pub = (k: keyof VisibilityMap) => vis[k] === "public";
  const age = ageFrom(med.birthDate);
  return {
    name: pub("fullName") ? med.fullName : "",
    age: pub("birthDate") && age !== null ? `${age} настай` : "",
    bloodType: pub("bloodType") ? med.bloodType : "",
    allergies: pub("allergies") ? med.allergies : "",
    conditions: pub("conditions") ? med.conditions : "",
    contact: pub("contacts") && med.contacts[0] ? `${med.contacts[0].relation || med.contacts[0].name}: ${med.contacts[0].phone}` : "",
  };
}
export type PublicSummary = ReturnType<typeof publicSummary>;
