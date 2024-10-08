import { useContext, useEffect, useState } from "react";
import MainContext from "../context/MainContext";
import { URL_BASE } from "@/config/config";
import { useToast } from "@/components/ui/use-toast";
import { format, addDays } from "date-fns";
import IMAGENDEFAULT from "/cropped-favicon.png";
import { Button } from "@/components/ui/button";

const NewRegisterModulos = () => {
  const { setCursoSeleccionadoNEW, navegarPaso, cursoSeleccionadoNEW } = useContext(MainContext);
  const [modules, setModules] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // Estado para manejar la carga
  const [error, setError] = useState(null); // Estado para manejar el error
  const { toast } = useToast();

  useEffect(() => {
    const fetchModules = async () => {
      try {
        setIsLoading(true); // Inicia la carga
        const response = await fetch(`${URL_BASE}/api/user/modules`);
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        setModules(data);
      } catch (error) {
        console.error("Error fetching modules:", error);
        setError("Failed to fetch modules.");
        toast({ title: "Error", description: "Failed to fetch modules.", duration: 2500 });
      } finally {
        setIsLoading(false); // Finaliza la carga
      }
    };

    fetchModules();
  }, [toast]);

  const handleSelectModule = (module) => {
    setCursoSeleccionadoNEW(module);
  };

  const handleContinue = () => {
    if (cursoSeleccionadoNEW) {
      setCursoSeleccionadoNEW(cursoSeleccionadoNEW);
      navegarPaso(1);
    }
  };

  const handlePrevious = () => {
    navegarPaso(-1);
  };

  // Función para formatear las fechas en dd/MM/yyyy y añadir un día al final
  const formatDate = (dateString, isEndDate = false) => {
    try {
      const date = new Date(dateString);
      if (isEndDate) {
        return format(addDays(date, 1), "dd/MM/yyyy");
      }
      return format(date, "dd/MM/yyyy");
    } catch (error) {
      return "Fecha Inválida";
    }
  };

  // Función para formatear el tiempo en formato 12h (AM/PM)
  const formatTime12h = (timeString) => {
    try {
      const [hours, minutes] = timeString.split(":");
      const date = new Date();
      date.setHours(parseInt(hours, 10));
      date.setMinutes(parseInt(minutes, 10));
      return format(date, "hh:mm a");
    } catch (error) {
      return "Hora Inválida";
    }
  };

  return (
    <div className="px-2">
      <div>
        <h3 className="text-xl font-extrabold text-center pb-6 px-4">Seleccione el módulo en el que se encuentra.</h3>
        {isLoading ? (
          <p>Cargando módulos...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : modules.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {modules.map((module) => (
              <div
                key={module.id}
                className={`border border-gray-300 rounded-lg overflow-hidden cursor-pointer shadow-lg p-4 transition-transform ease-in ${
                  cursoSeleccionadoNEW?.id === module.id ? "bg-blue-100 border-blue-400 dark:bg-blue-900 dark:border-blue-600" : ""
                }`}
                onClick={() => handleSelectModule(module)}
              >
                <img src={module.foto_url ?? IMAGENDEFAULT} alt={module.nombre} className="size-36 bg-cover mb-4 m-auto" />
                <div className="space-y-2">
                  <h4 className="text-2xl font-extrabold text-center">{module.nombre}</h4>
                  <p>{module.descripcion}</p>
                  <p className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="mr-2">
                      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                      <path d="M16 2a1 1 0 0 1 .993 .883l.007 .117v1h1a3 3 0 0 1 2.995 2.824l.005 .176v12a3 3 0 0 1 -2.824 2.995l-.176 .005h-12a3 3 0 0 1 -2.995 -2.824l-.005 -.176v-12a3 3 0 0 1 2.824 -2.995l.176 -.005h1v-1a1 1 0 0 1 1.993 -.117l.007 .117v1h6v-1a1 1 0 0 1 1 -1zm3 7h-14v9.625c0 .705 .386 1.286 .883 1.366l.117 .009h12c.513 0 .936 -.53 .993 -1.215l.007 -.16v-9.625z" />
                      <path d="M12 12a1 1 0 0 1 .993 .883l.007 .117v3a1 1 0 0 1 -1.993 .117l-.007 -.117v-2a1 1 0 0 1 -.117 -1.993l.117 -.007h1z" />
                    </svg>
                    {formatDate(module?.fecha_inicio)} - {formatDate(module?.fecha_fin, true)}
                  </p>
                  <p className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="mr-2">
                      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                      <path d="M17 3.34a10 10 0 1 1 -15 8.66l.005 -.324a10 10 0 0 1 14.995 -8.336m-5.401 9.576l.052 .021l.08 .026l.08 .019l.072 .011l.117 .007l.076 -.003l.135 -.02l.082 -.02l.103 -.039l.073 -.035l.078 -.046l.06 -.042l.08 -.069l.083 -.088l.062 -.083l2 -3a1 1 0 1 0 -1.664 -1.11l-.168 .251v-1.696a1 1 0 0 0 -.883 -.993l-.117 -.007a1 1 0 0 0 -1 1v5.026l.009 .105l.02 .107l.04 .129l.048 .102l.046 .078l.042 .06l.069 .08l.088 .083l.083 .062l.09 .053z" />
                    </svg>
                    {formatTime12h(module.horarioInicio)} - {formatTime12h(module.horarioFin)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No hay módulos disponibles.</p>
        )}
        <div className="flex justify-center mb-4 mt-8 gap-2">
          <Button onClick={handlePrevious} className="px-8 py-6 transition-opacity duration-300 bg-blue-500 text-white hover:bg-blue-600">
            Anterior
          </Button>
          <Button
            onClick={handleContinue}
            disabled={!cursoSeleccionadoNEW}
            className={`px-8 py-6 transition-opacity duration-300 ${
              cursoSeleccionadoNEW ? "bg-blue-500 text-white hover:bg-blue-600" : "bg-blue-300 text-white cursor-not-allowed"
            }`}
          >
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NewRegisterModulos;
