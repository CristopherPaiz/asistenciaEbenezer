import PropTypes from "prop-types";

// Loader component
const LoaderAE = ({ texto = "Cargando..." }) => (
  <div className="w-full overflow-hidden flex flex-col gap-2 justify-center items-center">
    <div className="flex justify-center items-center h-full">
      <div className="loader"></div>
      <style>{`
        .loader {
          border: 4px solid #f3f3f3; /* Light grey */
          border-top: 4px solid #3498db; /* Blue */
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 2s linear infinite;
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
    {texto !== "" && <h1>{texto}</h1>}
  </div>
);

export default LoaderAE;

LoaderAE.propTypes = {
  texto: PropTypes.string,
};
