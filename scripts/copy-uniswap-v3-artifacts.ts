import fse from 'fs-extra'
const { TASK_COMPILE_GET_COMPILATION_TASKS } = require("hardhat/builtin-tasks/task-names")
import { subtask } from "hardhat/config"
import * as path from "path";

let TASK_CREATE_UNISWAPV3_ARTIFACT = ''

subtask(
    TASK_COMPILE_GET_COMPILATION_TASKS,
    async (_, __, runSuper) => {
        const otherTasks = await runSuper()
        return [...otherTasks, TASK_CREATE_UNISWAPV3_ARTIFACT]
    }
);

subtask(TASK_CREATE_UNISWAPV3_ARTIFACT, async (_, { artifacts }) => {
    fse.copySync(
        path.join(__dirname, '../node_modules/@uniswap/v3-core/artifacts/contracts'),
        path.join((artifacts as any)['_artifactsPath'], '@uniswap/v3-core/contracts'),
        { overwrite: false }
    )
    fse.copySync(
        path.join(__dirname, '../node_modules/@uniswap/v3-periphery/artifacts/contracts'),
        path.join((artifacts as any)['_artifactsPath'], '@uniswap/v3-periphery/contracts'),
        { overwrite: false }
    )
});
