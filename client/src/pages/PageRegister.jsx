import LoaderAE from "@/components/LoaderAE";
import MainContext from "@/context/MainContext";
import { useState, useEffect, lazy, Suspense, useContext } from "react";

const NewRegister = lazy(() => import("./NewRegister"));
const NewRegisterTutores = lazy(() => import("./NewRegisterTutores"));
const NewRegisterModulos = lazy(() => import("./NewRegisterModulos"));

const RegistroPagina = () => {
  const [esEscritorio, setEsEscritorio] = useState(window.innerWidth > 768);

  const { pasoActual, setNombresNEW, setApellidosNEW, setFechaNacimientoNEW, setTelefonoNEW, setDireccionNEW, setCursoSeleccionadoNEW, navegarPaso } =
    useContext(MainContext);

  const pasos = [
    { label: "1. Datos Personales", component: <NewRegister /> },
    { label: "2. Módulos", component: <NewRegisterModulos /> },
    { label: "3. Tutores", component: <NewRegisterTutores /> },
  ];

  //useEffect para iniciar siempre en el paso 0
  useEffect(() => {
    navegarPaso(-100);
    // Reiniciar formulario
    setNombresNEW("");
    setApellidosNEW("");
    setFechaNacimientoNEW("");
    setTelefonoNEW("");
    setDireccionNEW("");
    setCursoSeleccionadoNEW(null);
  }, []);

  // CAMBIAR ESTILO SEGUN TAMAÑO DE PANTALLA
  useEffect(() => {
    const manejarCambioTamano = () => {
      setEsEscritorio(window.innerWidth > 768);
    };
    window.addEventListener("resize", manejarCambioTamano);
    return () => window.removeEventListener("resize", manejarCambioTamano);
  }, []);

  return (
    <div className="container mx-auto p-4 w-full sm:max-w-[1200px] min-w-[400px] sm:w-[600px]">
      <h1 className="text-4xl font-extrabold mt-8 text-center sm:mt-0">Nuevo Registro</h1>
      <h2 className="text-lg text-center mb-4">Llena los datos requeridos para continuar con el registro</h2>
      {/* BARRA DE NAVEGACION */}
      <nav className={`mb-4 ${esEscritorio ? "flex items-center justify-center" : "space-y-4"}`}>
        {pasos.map((paso, index) => (
          <div key={index} className={esEscritorio ? "flex items-center" : "mb-4"}>
            <div
              className={`
              ${esEscritorio ? "flex items-center" : "p-4 border rounded shadow-lg"}
              transition-all duration-300 ease-in-out
            `}
            >
              <h3
                className={`
                ${esEscritorio ? "text-base" : "text-2xl font-medium"}
                ${index === pasoActual ? "text-blue-600 dark:text-blue-400 font-black" : "text-gray-600 dark:text-gray-500 text-lg font-extralight"}
              `}
              >
                {paso.label}
              </h3>
              {!esEscritorio && index === pasoActual && (
                <div className="mt-4">
                  <Suspense fallback={<LoaderAE texto={"Cargando paso..."} />}>{paso.component}</Suspense>
                </div>
              )}
            </div>
            {esEscritorio && index < pasos.length - 1 && <span className="mx-2 text-gray-400">&gt;</span>}
          </div>
        ))}
      </nav>

      {esEscritorio && (
        <div>
          <Suspense fallback={<LoaderAE texto={"Cargando paso..."} />}>{pasos[pasoActual].component}</Suspense>
        </div>
      )}
    </div>
  );
};

export default RegistroPagina;
