import React, { useContext } from "react"; // <--- ESTO FALTABA
import { CalcuContext } from "../context"; 
import { Box, Grid } from "@mui/material"; // <--- ESTO FALTABA
import CeldaSuma from "./CeldaSuma";
import CeldaSig from "./CeldaSig";
import CeldaBinario from "./CeldaBinario";

const Caja = () => {
  //Traigo contexto para usar estado
  const calcu = useContext(CalcuContext);

  return (
    <Box
      width="80%"
      color="primary.contrastText"
      bgcolor="primary.main"
      border={1}
      borderColor="#777"
      boxShadow={1}
      borderRadius={4}
      p={2}
      m={2}
    >
      <Grid container direction="column" spacing={1}>
        <Grid item xs={12} align="center">
          <Grid container direction="row"> 
            <Grid item xs={8} align="center">
              <span style={{fontSize: 18}}>
                Convierta a binario el siguiente número decimal: 
              </span>
            </Grid>
            <Grid item xs={1} align="center">
              <div style = {{backgroundColor : "white", color: "red"}}> 
               {calcu.numeroDecimal}
              </div>  
            </Grid>
          </Grid>        
        </Grid>

        <Grid item xs={12}>
          <Grid container direction="row" justifyContent="center">
            <CeldaBinario pot={7} suma="128"/>
            <CeldaBinario pot={6} suma="+64"/>
            <CeldaBinario pot={5} suma="+32"/>
            <CeldaBinario pot={4} suma="+16"/>
            <CeldaBinario pot={3} suma="+8"/>
            <CeldaBinario pot={2} suma="+4"/>
            <CeldaBinario pot={1} suma="+2"/>
            <CeldaBinario pot={0} suma="+1"/>

            <CeldaSuma />
            <CeldaSig />
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <Grid container direction="row" spacing={2}> 
            <Grid item xs={8} align="center">
              <span style={{fontSize: 16}}>
                El numero {calcu.numeroDecimal} en binario de 8 bits es:
              </span>
            </Grid>
            <Grid item xs={2} align="center">
              <div style = {{backgroundColor : "white", color: "black"}}> 
              {calcu.numeroActualBinarioStr}
              </div>  
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Caja;