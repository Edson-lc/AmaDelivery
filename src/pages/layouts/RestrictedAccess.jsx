import { Button } from "@/components/ui/button";
import { createPageUrl } from "@/utils";

export function RestrictedAccess({ title, description }) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">{title}</h2>
        <p className="text-gray-600 mb-4">{description}</p>
        <Button onClick={() => (window.location.href = createPageUrl("Home"))}>
          Voltar para Home
        </Button>
      </div>
    </div>
  );
}
