interface RequiredAssembly {
  assemblies: string[]
  missingMessage: JSX.Element
}

const rounds: RequiredAssembly = {
  assemblies: [
    'Assembly-CSharp.dll',
    'UnityEngine.dll',
    'UnityEngine.CoreModule.dll'
  ],
  missingMessage: (
    <div>
      These can be found in the <code>$ROUNDS_INSTALL_DIR/Rounds_Data/Managed</code> folder.
    </div>
  )
};

const bepInEx: RequiredAssembly = {
  assemblies: [
    '0Harmony.dll',
    'BepInEx.dll'
  ],
  missingMessage: (
  <div>
    These can be found in any <b>r2modman</b>/<b>Thunderstore Mod Manager</b> profile. Open your profile folder, from there you can find these files in <code>./BepInEx/core/</code>
  </div>
  )
};

const unbound: RequiredAssembly = {
  assemblies: [ 'UnboundLib.dll' ],
  missingMessage: (<>This can be found in "Unbound" by willis81808 on <b>Thunderstore</b>.</>)
}

const modsPlus: RequiredAssembly = {
  assemblies: [ 'ModsPlus.dll' ],
  missingMessage: (<>This can be found in "ModsPlus" by willis81808 on <b>Thunderstore</b>.</>)
};

const moddingUtils: RequiredAssembly = {
  assemblies: [ 'ModdingUtils.dll' ],
  missingMessage: (<>This can be found in "ModdingUtils" by Pykess on <b>Thunderstore</b>.</>)
};

function getRequiredAssmeblies() {
  return [ rounds, bepInEx, unbound, modsPlus, moddingUtils ]
}

export default getRequiredAssmeblies;
export type { RequiredAssembly };