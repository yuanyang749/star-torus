import { FormField, type FormFieldConfig } from "@/components/formfield";
import { torusGeometry } from "@/components/formfield/geometries/torus";

const MyFormFieldGeometries = [torusGeometry] as const;

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
    "enabled": true,
    "holdMode": "magnet",
    "actions": {
      "hoverLight": true,
      "dragRotate": true,
      "wheelZoom": true,
      "clickPulse": true,
      "holdAction": true,
      "pointerParallax": true
    }
  }
} satisfies FormFieldConfig;

export function MyFormField() {
  return (
    <div style={{ width: "100%", minHeight: 420, aspectRatio: "1 / 1" }}>
      <FormField config={MyFormFieldConfig} geometries={MyFormFieldGeometries} />
    </div>
  );
}
