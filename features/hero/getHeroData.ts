import { db } from "@/app/db";
import { heroDefault, type HeroData } from "@/content/hero";

export async function getHeroData(): Promise<HeroData> {
  try {
    return (await db.query.hero.findFirst()) ?? heroDefault;
  } catch (error) {
    console.error("Error al cargar Hero de la base de datos:", error);
    return heroDefault;
  }
}
