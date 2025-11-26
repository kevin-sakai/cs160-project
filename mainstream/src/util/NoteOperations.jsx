const LOCALSTORAGE_KEY = "mainstream-notes";
const date = new Date();
const day = date.getDate();
const month = date.getMonth();
const year = date.getFullYear();
const formattedDate = `${month}-${day}-${year}`;
export function blankNote() {
  return {
    date: formattedDate,
    text: "",
  }
};

export function getNotesState() {
  const localNotes = localStorage.getItem(LOCALSTORAGE_KEY);
  return localNotes ? JSON.parse(localNotes) : [blankNote()];
}

export function updateNotes(notes, setNotes, currPage, noteText) {
  setNotes(oldNotes => 
    oldNotes.map((note, index) =>
      index === currPage ? {date: note.date, text: noteText} : note
    )
  );
  localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(notes));
}

export function changePage(notes, setNotes, currPage, targetPage, setNotePage, numPages, noteText) {
  updateNotes(notes, setNotes, currPage, noteText);
  if (targetPage >= numPages || targetPage < 0) {
    return;
  }
  setNotePage(targetPage);
}

export function addPage(notes, setNotes, currPage, setNotePage, noteText) {
  updateNotes(notes, setNotes, currPage, noteText);
  const newPageNum = notes.length;
  setNotes(oldNotes => [...oldNotes, blankNote()]);
  setNotePage(newPageNum);
}

export function deletePage(notes, setNotes, currPage, setNotePage) {
  const newPageNum = currPage === 0 ? currPage : currPage - 1;
  if (notes.length === 1) {
    setNotes([blankNote()]);
  } else {
    setNotes(oldNotes =>
      oldNotes.filter((elem, index) =>
        index !== currPage
      )
    )
  }
  setNotePage(newPageNum);
  localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(notes));
}