import { FormField, type FormFieldConfig } from "@/components/formfield";

export const MyFormFieldConfig = {
  "version": 1,
  "shape": "torus",
  "theme": {
    "background": "#000000",
    "star": "#FFFFFF",
    "glow": "#FFFFFF"
  },
  "motion": {
    "flowSpeed": 1,
    "pointScale": 1,
    "morphDuration": 1.35
  },
  "effects": {
    "hoverRadius": 220,
    "hoverIntensity": 1,
    "trailIntensity": 1
  },
  "interaction": {
    "enabled": false,
    "holdMode": "magnet"
  }
} satisfies FormFieldConfig;

export function MyFormField() {
  return (
    <div style={{ width: "100%", minHeight: 420, aspectRatio: "1 / 1" }}>
      <FormField config={MyFormFieldConfig} />
    </div>
  );
}
