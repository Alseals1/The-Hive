interface FormErrorProps {
  message?: string;
  id?: string;
}

export const FormError: React.FC<FormErrorProps> = ({ message, id }) => {
  if (!message) return null;

  return (
    <p
      id={id}
      role="alert"
      className="mt-1.5 text-xs text-red-400 font-body leading-snug"
    >
      {message}
    </p>
  );
};
