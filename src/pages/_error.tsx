import { NextPageContext } from 'next';
import { ErrorProps } from 'next/error';

function Error({ statusCode }: ErrorProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-foreground mb-4">
          {statusCode ? `Error ${statusCode}` : 'Error'}
        </h1>
        <p className="text-muted-foreground mb-4">
          {statusCode
            ? `Ha ocurrido un error ${statusCode} en el servidor`
            : 'Ha ocurrido un error en el cliente'}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Recargar página
        </button>
      </div>
    </div>
  );
}

Error.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error; 