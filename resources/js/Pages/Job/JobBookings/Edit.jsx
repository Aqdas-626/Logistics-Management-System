import Create from './Create';

export default function Edit(props) {
    // Reuse the Create form UI for editing as well.
    return <Create {...props} jobBooking={props.jobBooking} />;
}

