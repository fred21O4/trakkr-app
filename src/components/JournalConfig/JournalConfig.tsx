import { useEffect, useState } from "react";

function JournalConfig() {
    const [journalFolder, setJournalFolder]: any = useState("");

    const getJournalFolder = async () => {
        const state = await window.electron.getState();

        const { journalFolder } = state;
        return journalFolder;
    };

    async function chooseJournalPath() {
        let { canceled, filePaths } = await window.electron.chooseJournalFolder();
        if (!canceled) {
            await saveJournalFolder(filePaths[0])
        }
    }

    async function saveJournalFolder(journalFolder: string) {
        const state = await window.electron.getState();
        setJournalFolder(journalFolder)
        window.electron.setState({ ...state, journalFolder: journalFolder, activeCommander: { active: [], completed: [] } });
    }

    useEffect(() => {
        const fetchJournalFolder = async () => {
            const journalFolder = await getJournalFolder();

            if (journalFolder) {
                saveJournalFolder(journalFolder);
            }
        };

        fetchJournalFolder();
    }, []);

    return (
        <div className="JournalConfig w-full h-full flex flex-column justify-content-start gap-2 my-4">
            <div>Journal Folder: <span className="JournalFolder">{journalFolder} </span><button className="accent" onClick={chooseJournalPath}>Change</button></div>
        </div>
    );
}

export default JournalConfig;
