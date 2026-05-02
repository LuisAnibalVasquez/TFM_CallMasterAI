export class Client {
  constructor(
    public readonly name: string,
    public readonly phone: string,
    public readonly age: number,
    public readonly language: string,
  ) {}

  static fromCsvRow(row: any): Client {
    // Basic validation could be here
    return new Client(
      row["Customer Name"] || row["Nombre del cliente"],
      row["Phone Number"] || row["telefono"],
      Number(row["Age"] || row["edad"]),
      row["Preferred Language"] || row["idioma de preferencia"],
    );
  }
}
