import { FormField, type FormFieldConfig } from "@/components/formfield";
import { celestialGyroGeometry } from "@/components/formfield/geometries/celestial-gyro";

const CelestialGyroFieldGeometries = [celestialGyroGeometry] as const;

export const CelestialGyroFieldConfig = {
  "version": 1,
  "shape": "celestial-gyro",
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
  },
  "content": {
    "text": "形场实验室"
  }
} satisfies FormFieldConfig;

export function CelestialGyroField() {
  return (
    <div style={{ width: "100%", minHeight: 420, aspectRatio: "1 / 1" }}>
      <FormField config={CelestialGyroFieldConfig} geometries={CelestialGyroFieldGeometries} />
    </div>
  );
}
