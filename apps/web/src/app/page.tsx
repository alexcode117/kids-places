import { Explorer } from "@/components/Explorer";
import { getAds, getCities, getPlaces } from "@/lib/data";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default async function Home() {
  const cities = await getCities();
  const city = cities.find((c) => c.isActive) ?? cities[0];
  const [places, ads] = await Promise.all([getPlaces(city.slug), getAds()]);
  return <Explorer places={places} ads={ads} cities={cities} demo={!isSupabaseConfigured} />;
}
