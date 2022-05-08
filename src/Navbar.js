
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export default function Navbar({options,onChange,selected}){

  console.log(options);

  return (
    <div class="row">
      {Object.entries(options).map(entry => {
        return <div onClick={()=>onChange(entry[0])} class={
          "todo-nav"+(selected===entry[0]?" selected":"")
  }>{capitalizeFirstLetter(entry[1])}</div>

      })}
    </div>
  )


}
