import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';
import { ExecutionResult, GridConfig, ManipulatorState, Sample } from '../manipulator/types';
import { simulateExecution } from '../manipulator/commands';

export interface ExecuteCommandsRequest {
    rawCommand: string;
    grid: GridConfig;
    samples: Sample[];
    manipulator: ManipulatorState;
}

export const manipulatorApi = createApi({
    reducerPath: 'manipulatorApi',
    baseQuery: fakeBaseQuery(),
    endpoints: (builder) => ({
        executeCommands: builder.mutation<ExecutionResult, ExecuteCommandsRequest>({
            queryFn: (body) => {
                const result = simulateExecution(
                    body.rawCommand,
                    body.manipulator,
                    body.samples,
                    body.grid
                );
                return { data: result };
            }
        })
    })
});

export const { useExecuteCommandsMutation } = manipulatorApi;