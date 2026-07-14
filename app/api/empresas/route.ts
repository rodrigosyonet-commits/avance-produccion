
import { EMPRESAS } from "@/lib/empresas";

export async function GET() {

  return Response.json(
    EMPRESAS
  );

}
