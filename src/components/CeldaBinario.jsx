import { useContext } from 'react';
import { Box, Grid, Button } from '@mui/material'
import {CalcuContext,CalcuDispatchContext} from "../context";
import mal from "../sounds/mal.wav"
import ok from "../sounds/ok.wav"

const CeldaBinario = ({pot, suma}) => {

  //Traigo contexto para usar estado
  const calcu = useContext(CalcuContext);
  const dispatch = useContext(CalcuDispatchContext);

  //Seteo color de suma (+2^pot)
  let color_suma = "white"
  let fondo_suma = "#1976d2"
  //Si hubo un cambio a 1 en este bit
  if (calcu.numeroBinario[pot] === 1 ){
    //fondo_suma = "white"
    //Si fue correcto
    if (calcu.arrayBinarioActual[pot] === 1){
      color_suma = "#76ff03"
      fondo_suma = "black"

    }else {//si fue incorrecto
      color_suma = "red"
      fondo_suma = "black"
    }
  }else {
    fondo_suma = "#1976d2"
  }

  //Si hubo un cambio a 1 en este bit
  if (calcu.numeroBinario[pot] === 1 && calcu.indiceJugada === pot){
    //Ejecuto sonido bien/mal
    playSound(calcu.sonido)
  }

  
  function playSound(result){
    result === "ok" ? new Audio(ok).play() : new Audio(mal).play()
  }

  return (
    <>
    <Grid item xs={1}>
      <Box
        sx={{ fontSize: "1rem" }}
        color="primary.contrastText"
        bgcolor="primary.main"
        borderColor="#000"
        p={1.5}
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Grid
          container
          direction="column"
          justifyContent="center"
          align="center"
          alignItems="center"
          spacing={1}
        >
          <Grid item>2<sup>{pot}</sup></Grid>
          <Grid item>
            <Button
              onClick={() => {
                //Discrimino porque react ejecuta el dispatch dos veces
                if (calcu.numeroBinario[pot] === 1){
                  dispatch({
                    type: 'cambioBitA0',
                    pot: {pot}
                  });
                }else{
                  dispatch({
                    type: 'cambioBitA1',
                    pot: {pot}
                  });
                }
              }}
              style={{
                maxWidth: "25px",
                maxHeight: "25px",
                minWidth: "10px",
                minHeight: "10px",
                color: "#0F0",
                backgroundColor: "#000",
                padding: "5px",
              }}
            >
              {calcu.numeroBinario[pot]}
            </Button>
          </Grid>
          <Grid item>
            <div style = {{ backgroundColor: fondo_suma, color: color_suma }}>
              {suma}
            </div>
          </Grid>
        </Grid>
      </Box>
    </Grid>
  </>
  )
}

export default CeldaBinario
