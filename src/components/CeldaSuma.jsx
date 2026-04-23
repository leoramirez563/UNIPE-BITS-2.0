import React, { useContext } from "react";
import { Box, Grid } from "@mui/material";
import { CalcuContext } from "../context";

const CeldaSuma = () => {
  
    //Traigo contexto para usar estado
  const calcu = useContext(CalcuContext);

  return (
    <Grid item xs={1}>
      <Grid
        container
        direction="column"
        justifyContent="left"
        align="left"
        alignItems="left"
        spacing={0}
      >
        <Grid item>
          <Box
            color="secundary"
            bgcolor="secundary.main"
            borderColor="#000"
            marginTop={5}
            marginLeft={2}
            display="flex"
            justifyContent="center"
          >
            <span style={{fontSize: 18 ,backgroundColor : 'white', color: 'black'}}>
            = {calcu.sumaParcial}
            </span>

          </Box>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default CeldaSuma;
