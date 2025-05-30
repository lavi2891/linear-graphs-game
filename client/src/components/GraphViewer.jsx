/* global Desmos */
import { useEffect, useRef } from 'react';

const GraphViewer = ({ expressions }) => {
  const calculatorRef = useRef(null);

  useEffect(() => {
    const calculator = Desmos.GraphingCalculator(calculatorRef.current, {
      expressions: false,
      settingsMenu: false,
      keypad: false,
    });

    expressions.forEach((expr, index) => {
      calculator.setExpression({
        id: `line${index}`,
        latex: expr,
        color: index === 0 ? Desmos.Colors.BLUE : Desmos.Colors.RED,
      });
    });

    return () => calculator.destroy();
  }, [expressions]);

  return (
    <div style={{ width: '600px', height: '400px' }} ref={calculatorRef}></div>
  );
};

export default GraphViewer;
