

export const CustButton = ({text,func}) => {
    return (
        <button class="button-14" id="btn-restart" onClick={func}>
        <i class="fas fa-sync"></i> {text}
      </button>
    )
}