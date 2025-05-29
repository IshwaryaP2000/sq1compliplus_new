export const Badge = ({ className = '', marginClass = '', children }) => {
    return (
      <span className={`${className} ${marginClass}`}>
        {children}
      </span>
    );
  };
