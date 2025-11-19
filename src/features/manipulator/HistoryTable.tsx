import React from 'react';
import {
    Box,
    Button,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Typography
} from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { clearHistory } from './historySlice';

export const HistoryTable: React.FC = () => {
    const items = useAppSelector((s) => s.history.items);
    const dispatch = useAppDispatch();

    return (
        <Box>
            <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={1}
                flexWrap="wrap"
                gap={1}
            >
                <Typography variant="h6" fontSize={{ xs: 16, sm: 20 }}>
                    История выполненных команд
                </Typography>
                <Button
                    size="small"
                    variant="outlined"
                    onClick={() => dispatch(clearHistory())}
                    disabled={!items.length}
                >
                    Очистить
                </Button>
            </Box>
            {!items.length ? (
                <Typography variant="body2" color="text.secondary">
                    История пуста.
                </Typography>
            ) : (
                <Box sx={{ width: '100%', overflowX: 'auto', maxHeight: 260 }}>
                    <Table size="small" stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ whiteSpace: 'nowrap' }}>
                                    Дата и время
                                </TableCell>
                                <TableCell sx={{ whiteSpace: 'nowrap' }}>
                                    Исходная команда
                                </TableCell>
                                <TableCell sx={{ whiteSpace: 'nowrap' }}>
                                    Оптимизированная
                                </TableCell>
                                <TableCell>Образцы до</TableCell>
                                <TableCell>Образцы после</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {items.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell sx={{ whiteSpace: 'nowrap' }}>
                                        {new Date(item.createdAt).toLocaleString()}
                                    </TableCell>
                                    <TableCell>{item.rawCommand}</TableCell>
                                    <TableCell>{item.optimizedCommand}</TableCell>
                                    <TableCell sx={{ minWidth: 140 }}>
                                        {item.samplesBefore
                                            .map(
                                                (s) =>
                                                    `${s.id}:(${s.position.x},${s.position.y})`
                                            )
                                            .join(', ')}
                                    </TableCell>
                                    <TableCell sx={{ minWidth: 140 }}>
                                        {item.samplesAfter
                                            .map(
                                                (s) =>
                                                    `${s.id}:(${s.position.x},${s.position.y})`
                                            )
                                            .join(', ')}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Box>
            )}
        </Box>
    );
};