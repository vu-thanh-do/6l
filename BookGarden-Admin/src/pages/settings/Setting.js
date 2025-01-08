import React, { useEffect, useState } from "react";

const Setting = () => {
  const [dt, setDt] = useState();
  const [value,setValue] = useState(0);
  useEffect(() => {
    (async () => {
      try {
        const data = await fetch("http://localhost:3100/api/get-time");
        const newData = await data.json();
        setDt(newData.time);
      } catch (error) {
        console.log("Failed to fetch event list:" + error);
      }
    })();
  }, []);
  return (
    <div style={{ marginTop: 20 }}>
      <p>day current : {dt}</p>
      <input placeholder="enter day " onChange={(e)=>setValue(e.target.value)} />
      <button onClick={async()=>{
        if(value <=0){
            alert("Số ngày phải lớn hơn 0")
            return
        } 
        const data = await fetch("http://localhost:3100/api/set-time?time=" + value);
        setTimeout(()=>{
            window.location.reload()
        },1500)
      }}>submit</button>
    </div>
  );
};

export default Setting;
