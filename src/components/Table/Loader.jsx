export const Loader=({rows=7,cols=7})=>{
    return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <tr key={rowIndex}>
          {Array.from({ length: cols }).map((_, colIndex) => (
            <td key={colIndex}>
              <p className="placeholder-glow">
                <span className="placeholder col-12 bg-secondary"></span>
              </p>
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}