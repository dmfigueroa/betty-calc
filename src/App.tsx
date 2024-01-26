import {
  json,
  useActionData,
  useFetcher,
  useSubmit,
  type LoaderFunctionArgs,
} from "react-router-dom";
import { Input } from "./components/ui/input";
import { Label } from "./components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./components/ui/select";

export async function action({ request }: LoaderFunctionArgs) {
  const formData = Object.fromEntries((await request.formData()).entries());

  const conversionsResponse = await fetch("/api/currencies");
  const conversions = (await conversionsResponse.json()) as {
    usd: number;
    hnl: number;
  };

  const oldValue = Number(formData.old);
  let currentValue = (oldValue * 162.77) / 45.33;

  const currency = formData.currency as "cop" | "usd" | "hnl";
  if (currency === "usd") {
    currentValue = currentValue * conversions.usd;
  }

  if (currency === "hnl") {
    currentValue = currentValue * conversions.hnl;
  }

  return json({
    old: oldValue,
    currency,
    current: currentValue,
  });
}

export function App() {
  const fetcher = useFetcher();
  const data = useActionData() as
    | {
        old: number;
        currency: "cop" | "usd" | "hnl";
        current: number;
      }
    | undefined;
  const submit = useSubmit();

  const formattedValue = (data?.current || 0).toLocaleString("es-CO", {
    style: "currency",
    currency: data?.currency || "cop",
  });

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen mx-auto min-w-96"
      style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}
    >
      <h1 className="py-8">Plata Betty</h1>
      <fetcher.Form
        className="w-full flex flex-col gap-4"
        method="post"
        onChange={(event) => {
          submit(event.currentTarget);
        }}
      >
        <div className="flex items-center space-x-2">
          <Label className="w-1/6" htmlFor="old">
            Plata de Betty
          </Label>
          <Input
            id="old"
            className="w-full"
            name="old"
            type="number"
            placeholder="Plata de Betty"
            defaultValue={data?.old}
          />
        </div>
        <div className="flex items-center space-x-2">
          <Label className="w-1/6" htmlFor="old">
            Moneda
          </Label>
          <Select name="currency" defaultValue={data?.currency || "cop"}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Moneda" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cop">Pesos Colombianos</SelectItem>
              <SelectItem value="usd">Dólares Americanos</SelectItem>
              <SelectItem value="hnl">Lempiras hondureñoos</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center space-x-2">
          <Label className="w-1/6" htmlFor="current">
            Actual
          </Label>
          {formattedValue}
        </div>
      </fetcher.Form>
    </div>
  );
}
