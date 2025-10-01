const customStorage = {
  getItem: (name) => {
    const data = localStorage.getItem("flowtrack");
    return data ? JSON.parse(data)[name] : null;
  },
  setItem: (name, value) => {
    const data = JSON.parse(localStorage.getItem("flowtrack") || "{}");
    data[name] = value;
    localStorage.setItem("flowtrack", JSON.stringify(data));
  },
  removeItem: (name) => {
    const data = JSON.parse(localStorage.getItem("flowtrack") || "{}");
    delete data[name];
    localStorage.setItem("flowtrack", JSON.stringify(data));
  },
};

export default customStorage;
