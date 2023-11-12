import fs from 'fs/promises';
import path from "path";
import { BrowserWindow, dialog, shell, ipcMain } from "electron";
import { ModBundle } from './preload';
import { exec } from 'child_process';

function initCustomBehavior(window: BrowserWindow) {
  ipcMain.handle('application:minimize', async () => {
    window.minimize();
  });
  
  ipcMain.handle('application:maximize', async () => {
    if (window.isMaximized()) {
      window.unmaximize();
    } else {
      window.maximize();
    }
  });
  
  ipcMain.handle('application:exit', async () => {
    window.close();
  });

  ipcMain.handle('modApi:selectFolder', async (e, dialogTitle: string) => {
    const { canceled, filePaths } = await dialog.showOpenDialog(window, {
      title: dialogTitle,
      properties: ['openDirectory']
    });
    if (canceled) {
      return '';
    } else {
      return filePaths[0];
    }
  });

  ipcMain.handle('modApi:showFile', async (e, path: string) => {
    shell.showItemInFolder(path);
  });

  ipcMain.handle('modApi:getAssemblies', async (e, libFolderPath: string) => {
    return await getAssemblies(libFolderPath);
  });

  ipcMain.handle('modApi:exportMod', async (e, bundle: ModBundle) => {  
    // Destructure the data from the bundle
    const { modName, csproj, exportFolder, scripts } = bundle;
  
    let result;
    let buildOutput = '';

    try {
      // Create the export directory if it doesn't exist
      await fs.mkdir(exportFolder, { recursive: true });
  
      // Create the .csproj file in the target location
      const csprojPath = path.join(exportFolder, `${modName}.csproj`);
      await fs.writeFile(csprojPath, csproj);
  
      // Create the src directory
      const srcFolderPath = path.join(exportFolder, 'src');
      await fs.mkdir(srcFolderPath, { recursive: true });
  
      // Create each script file in the src folder
      for (const script of scripts) {
        const scriptPath = path.join(srcFolderPath, `${script.name}.cs`);
        await fs.writeFile(scriptPath, script.content);
      }

      // Build the project
      const csprojFilePath = path.join(exportFolder, `${modName}.csproj`);
      const buildCommand = `dotnet build "${csprojFilePath}" -c Release`;
  
      // Execute the build command in the export folder
      await new Promise((resolve, reject) => {
        exec(buildCommand, { cwd: exportFolder }, (error, stdout, stderr) => {
          if (error) {
            console.error('Build error:', error);
            buildOutput = stdout;
            return reject(error);
          }
          console.log('Build stdout:', stdout);
          console.error('Build stderr:', stderr);
          buildOutput = stdout;
          resolve({ stdout });
        });
      });

      // Move binary from bin to export folder
      const binaryPath = path.join(exportFolder, 'bin', 'Release', 'netstandard2.1', `${modName}.dll`);
      const binaryDest = path.join(exportFolder, `${modName}.dll`);
      await fs.rename(binaryPath, binaryDest);

      result = {
        status: 'success',
        binary: binaryDest,
        output: buildOutput
      }
    } catch (error) {
      console.error('Error creating mod:', error);
      result = {
        status: 'error',
        message: error,
        output: buildOutput
      }
    }

    // Cleanup files from build process
    await fs.rm(path.join(exportFolder, 'bin'), { recursive: true, force: true });
    await fs.rm(path.join(exportFolder, 'obj'), { recursive: true, force: true });
    await fs.rm(path.join(exportFolder, 'src'), { recursive: true, force: true });
    await fs.rm(path.join(exportFolder, `${modName}.csproj`));

    return result;
  });
}

async function getAssemblies(libFolder: string) {
  const contents = await fs.readdir(libFolder, { withFileTypes: true });

  const assemblies = contents.filter(file => file.isFile() && path.extname(file.name) === '.dll');
  const assemblyPaths = assemblies.map(folder => path.join(libFolder, folder.name));

  const results = assemblyPaths.map(p => {
    const fileNameWithExtension = path.basename(p);
    const fileName = path.parse(fileNameWithExtension).name;
    return {
      path: p,
      name: fileName
    }
  });

  return results;
}

export default initCustomBehavior;