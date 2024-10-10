import React from "react";

const Rank = ({name, entries}) => {
    return (
     <div>
        <div className="mg5, white f2">
         {`${name}, your current entry count is...`}
        </div>
        <div className="f1 white">
            {`${entries}`}
        </div>
     </div>
    )
}

export default Rank; 