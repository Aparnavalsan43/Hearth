function FormField({ label, name, type = 'text', value, onChange, autoComplete }) {
  return (
    <label className="form-field" htmlFor={name}>
      <span>{label}</span>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        required
      />
    </label>
  )
}

export default FormField
