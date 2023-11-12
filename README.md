<div align="center">
  <img src="https://raw.githubusercontent.com/willis81808/DeckSmith/main/assets/icon.png" width="250px" style="user-select: none;" />
  <h1>DeckSmith</h1>
  Unleash your creativity and craft custom card mods with ease, bringing your unique strategies and styles to life in the world of ROUNDS without writing a single line of code.
</div>

<br>

## Install

Clone the repo and install dependencies:

```bash
git clone https://github.com/willis81808/DeckSmith.git
cd DeckSmith
npm install
```

or install a prebuilt [release](https://github.com/willis81808/DeckSmith/releases).

## Setup

DeckSmith requires the .NET SDK to be installed and certain Unity assemblies and mod dependencies to be referenced to successfully build/export your mod. I recommend the following steps:

1. Install the [.NET SDK](https://dotnet.microsoft.com/en-us/download)
1. Create a `Libs` folder somewhere memorable, but out of the way.
1. Copy all files from `${ROUNDS_INSTALL_DIR}/Rounds_Data/Managed` to your `Libs` folder.
1. Download [ModsPlus](https://rounds.thunderstore.io/package/willis81808/ModsPlus/) and copy `ModsPlus.dll` to your `Libs` folder.
1. Download [ModdingUtils](https://rounds.thunderstore.io/package/Pykess/ModdingUtils/) and copy `ModdingUtils.dll` to your `Libs` folder.
1. Launch DeckSmith and configure your `Libs` folder path as the "Library Folder" under Mod Configuration
1. Start creating!

## Starting Development

Start the app in the `dev` environment:

```bash
npm start
```

## Packaging for Production

To package apps for the local platform:

```bash
npm run package
```
