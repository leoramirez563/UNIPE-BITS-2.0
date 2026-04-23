import {createContext} from "react";

export const calcuInicial = {
  indiceNumeroDecimal: 0,
  numeroBinario: [0, 0, 0, 0, 0, 0, 0, 0],
  sumaParcial: 0,
  botonSigInactivo: true,
  numeroDecimal: 3,
  arrayBinarioActual: [1, 1, 0, 0, 0, 0, 0, 0],
  puntaje: 0,
  malaJugada: false,
  indiceJugada: -1,
  numeroActualBinarioStr: "",
  sonido: "sig",
};

//Creo contexto
export const CalcuContext = createContext();
export const CalcuDispatchContext = createContext();


