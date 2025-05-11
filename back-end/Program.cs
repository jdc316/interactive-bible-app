#region Initialization

using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
    c.SwaggerDoc(
        "v1",
        new Microsoft.OpenApi.Models.OpenApiInfo
        {
            Title = "Interactive Bible App API",
            Version = "v1",
        }
    )
);
builder.Services.AddCors(options =>
{
    options.AddPolicy(
        "AllowAllOrigins",
        builder => builder.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader()
    );
});

var connection = String.Empty;
if (builder.Environment.IsDevelopment())
{
    builder.Configuration.AddEnvironmentVariables().AddJsonFile("appsettings.Development.json");
    connection =
        builder.Configuration.GetConnectionString("AZURE_SQL_CONNECTIONSTRING")
        ?? throw new Exception("Connection string not found in appsettings.Development.json");
}
else
{
    connection =
        Environment.GetEnvironmentVariable("AZURE_SQL_CONNECTIONSTRING")
        ?? throw new Exception("Connection string not found in environment variables");
}

builder.Services.AddDbContext<DbContext>(options => options.UseSqlServer(connection));

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

#endregion

#region VerseReference Endpoints

app.MapGet(
        "/verses",
        async (DbContext db) =>
        {
            var verseReferences = await db.VerseReferences.ToListAsync();
            return Results.Ok(verseReferences);
        }
    )
    .WithName("GetAllVerseReferences")
    .WithOpenApi();

app.MapPost(
        "/verses",
        async (DbContext db, VerseReference verseReference) =>
        {
            db.VerseReferences.Add(verseReference);
            await db.SaveChangesAsync();
            return Results.Created($"/verses/{verseReference.Id}", verseReference);
        }
    )
    .WithName("CreateVerseReference")
    .WithOpenApi();

app.MapPut(
        "/verses/{id}",
        async (DbContext db, int id, VerseReference updatedVerseReference) =>
        {
            var verseReference = await db.VerseReferences.FindAsync(id);
            if (verseReference is null)
                return Results.NotFound();

            verseReference.Book = updatedVerseReference.Book;
            verseReference.Chapter = updatedVerseReference.Chapter;
            verseReference.Verse = updatedVerseReference.Verse;
            verseReference.Text = updatedVerseReference.Text;
            verseReference.Translation = updatedVerseReference.Translation;
            verseReference.Language = updatedVerseReference.Language;

            await db.SaveChangesAsync();
            return Results.NoContent();
        }
    )
    .WithName("UpdateVerseReference")
    .WithOpenApi();

app.MapDelete(
        "/verses/{id}",
        async (DbContext db, int id) =>
        {
            var verseReference = await db.VerseReferences.FindAsync(id);
            if (verseReference is null)
                return Results.NotFound();

            db.VerseReferences.Remove(verseReference);
            await db.SaveChangesAsync();
            return Results.NoContent();
        }
    )
    .WithName("DeleteVerseReference")
    .WithOpenApi();

#endregion

#region CrossReference Endpoints

app.MapGet(
        "/cross-references",
        async (DbContext db) =>
        {
            var crossReferences = await db.CrossReferences.ToListAsync();
            return Results.Ok(crossReferences);
        }
    )
    .WithName("GetAllCrossReferences")
    .WithOpenApi();

app.MapPost(
        "/cross-references",
        async (DbContext db, CrossReference crossReference) =>
        {
            db.CrossReferences.Add(crossReference);
            await db.SaveChangesAsync();
            return Results.Created($"/cross-references/{crossReference.Id}", crossReference);
        }
    )
    .WithName("CreateCrossReference")
    .WithOpenApi();

app.MapPut(
        "/cross-references/{id}",
        async (DbContext db, int id, CrossReference updatedCrossReference) =>
        {
            var crossReference = await db.CrossReferences.FindAsync(id);
            if (crossReference is null)
                return Results.NotFound();

            crossReference.SourceVerseId = updatedCrossReference.SourceVerseId;
            crossReference.TargetVerseId = updatedCrossReference.TargetVerseId;

            await db.SaveChangesAsync();
            return Results.NoContent();
        }
    )
    .WithName("UpdateCrossReference")
    .WithOpenApi();

app.MapDelete(
        "/cross-references/{id}",
        async (DbContext db, int id) =>
        {
            var crossReference = await db.CrossReferences.FindAsync(id);
            if (crossReference is null)
                return Results.NotFound();

            db.CrossReferences.Remove(crossReference);
            await db.SaveChangesAsync();
            return Results.NoContent();
        }
    )
    .WithName("DeleteCrossReference")
    .WithOpenApi();

#endregion

app.Run();
