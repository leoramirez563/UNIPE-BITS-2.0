import React, { useContext } from "react";
import { CalcuContext, CalcuDispatchContext } from "../context";
import { Button, Grid } from "@mui/material";
import sig from "../sounds/sig.wav"

const CeldaSig = () => {
  //Traigo contexto para usar estado
  const calcu = useContext(CalcuContext);
  const dispatch = useContext(CalcuDispatchContext);

  //Por defecto no muestro Ok
  let muestro_ok = "";
  if (!calcu.botonSigInactivo) {
    muestro_ok = "(+20)";
  }
  if (calcu.malaJugada) {
    muestro_ok = "(-20)";
  }

    //Si hay nuevo numero
    if (calcu.indiceJugada === -1){
      //Ejecuto sonido bien/mal
      playSound(calcu.sonido)
    }
  
    function playSound(){
      new Audio(sig).play()
    }
  
  return (
    <Grid item xs={3}>
      <Grid
        container
        direction="column"
        justifyContent="top"
        align="center"
        alignItems="center"
        spacing={3}
      >
        <Grid item align="center" alignItems="center">
          <Button
            color="success"
            onClick={() => {
              dispatch({
                type: "sigNum",
              });
            }}
            disabled={calcu.botonSigInactivo}
            style={{
              maxWidth: "80px",
              maxHeight: "20px",
              minWidth: "5px",
              minHeight: "5px",
              backgroundColor: "#FFF",
              padding: "5px",
            }}
          >
            Siguiente
          </Button>
        </Grid>
        <Grid item></Grid>
        <Grid item>
          <Grid
            container
            direction="row"
            justifyContent="left"
            align="left"
            alignItems="left"
            spacing={1}
          >
            <Grid item>
              <span style={{ fontWeight: "bold" }}>
                Puntos: {calcu.puntaje}
              </span>
            </Grid>
            <Grid item>
              <span>{muestro_ok}</span>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default CeldaSig;
