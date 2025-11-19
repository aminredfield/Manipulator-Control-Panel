import React from 'react';
import { Box, Typography, useMediaQuery, useTheme } from '@mui/material';
import { useAppSelector } from '../../app/hooks';

export const ManipulatorCanvas: React.FC = () => {
  const grid = useAppSelector((s) => s.manipulator.grid);
  const manipulator = useAppSelector((s) => s.manipulator.manipulator);
  const samples = useAppSelector((s) => s.manipulator.samples);

  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));

  const cellSize = isSmall ? 24 : 32;

  return (
    <Box>
      <Typography variant="h6" mb={1} fontSize={{ xs: 16, sm: 20 }}>
        Стол лаборатории
      </Typography>
      <Box
        sx={{
          border: '1px solid rgba(255,255,255,0.2)',
          display: 'inline-block',
          overflow: 'auto',
          maxHeight: { xs: 260, sm: 400 },
          maxWidth: '100%'
        }}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: `repeat(${grid.width}, ${cellSize}px)`,
            gridTemplateRows: `repeat(${grid.height}, ${cellSize}px)`
          }}
        >
          {Array.from({ length: grid.height }).map((_, y) =>
            Array.from({ length: grid.width }).map((_, x) => {
              const isManipulator =
                manipulator.position.x === x &&
                manipulator.position.y === y;

              const samplesHere = samples.filter(
                (s) =>
                  s.position.x === x &&
                  s.position.y === y &&
                  s.id !== manipulator.holdingSampleId
              );
              const hasSample = samplesHere.length > 0;

              const isHolding = !!manipulator.holdingSampleId;

              return (
                <Box
                  key={`${x}:${y}`}
                  sx={{
                    width: cellSize,
                    height: cellSize,
                    border: '1px solid rgba(255,255,255,0.12)',
                    position: 'relative',
                    boxSizing: 'border-box',
                    backgroundColor: isManipulator
                      ? 'rgba(33,150,243,0.35)'
                      : 'transparent'
                  }}
                >
                  {hasSample && (
                    <Box
                      sx={{
                        width: isSmall ? 12 : 16,
                        height: isSmall ? 12 : 16,
                        borderRadius: '50%',
                        backgroundColor: 'orange',
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)'
                      }}
                    />
                  )}

                  {isManipulator && (
                    <>
                      <Box
                        sx={{
                          width: isSmall ? 12 : 16,
                          height: isSmall ? 12 : 16,
                          borderRadius: '25%',
                          backgroundColor: 'deepskyblue',
                          position: 'absolute',
                          bottom: 2,
                          right: 2
                        }}
                      />
                      {isHolding && (
                        <Box
                          sx={{
                            width: isSmall ? 8 : 10,
                            height: isSmall ? 8 : 10,
                            borderRadius: '50%',
                            backgroundColor: 'orange',
                            position: 'absolute',
                            bottom: 4,
                            right: isSmall ? 16 : 20
                          }}
                        />
                      )}
                    </>
                  )}
                </Box>
              );
            })
          )}
        </Box>
      </Box>
      <Typography
        variant="body2"
        mt={1}
        fontSize={{ xs: 12, sm: 14 }}
        color="text.secondary"
      >
        Позиция манипулятора: ({manipulator.position.x},{' '}
        {manipulator.position.y}){manipulator.holdingSampleId
          ? `, держит образец ${manipulator.holdingSampleId}`
          : ', образец не удерживается'}
      </Typography>
    </Box>
  );
};