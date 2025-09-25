import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Entregador } from "@/api/entities";
import EntregadorDetails from "@/components/entregadores/EntregadorDetails";
import EntregadorForm from "@/components/entregadores/EntregadorForm";
import { Button } from "@/components/ui/button";

export default function EntregadorDetalhesPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [entregador, setEntregador] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await Entregador.get(id);
      setEntregador(data);
    } catch (e) {
      console.error("Falha ao carregar entregador", e);
    }
    setLoading(false);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-4 md:p-8">
        <div className="max-w-5xl mx-auto">
          <div className="h-64 bg-white/80 shadow-lg rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (!entregador) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Entregador não encontrado.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {editing ? (
          <EntregadorForm
            entregador={entregador}
            onSubmit={async (formData) => {
              try {
                await Entregador.update(entregador.id, formData);
                setEditing(false);
                await load();
              } catch (e) {
                console.error("Falha ao atualizar", e);
              }
            }}
            onCancel={() => setEditing(false)}
          />
        ) : (
          <>
            <EntregadorDetails
              entregador={entregador}
              onBack={() => navigate(-1)}
              onApprove={async (idOrChange) => {
                try {
                  await Entregador.update(entregador.id, { aprovado: true, status: 'ativo' });
                  await load();
                } catch (e) {
                  console.error("Falha ao aprovar", e);
                }
              }}
              onReject={async () => {
                try {
                  await Entregador.update(entregador.id, { aprovado: false, status: 'suspenso' });
                  await load();
                } catch (e) {
                  console.error("Falha ao rejeitar", e);
                }
              }}
              onEdit={() => setEditing(true)}
            />
          </>
        )}
      </div>
    </div>
  );
}




