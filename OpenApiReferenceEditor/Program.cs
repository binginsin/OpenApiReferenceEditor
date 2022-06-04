using ElectronNET.API;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllersWithViews().
    AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.WriteIndented = true;
    });

builder.WebHost.UseElectron(args);

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{

}

app.MapGet("/debug/routes", (IEnumerable<EndpointDataSource> endpointSources) =>
        string.Join("\n", endpointSources.SelectMany(source => source.Endpoints)));
app.UseStaticFiles();
app.UseRouting();

app.MapDefaultControllerRoute();

app.MapFallbackToFile("index.html"); ;

Task.Run(async () =>
{
    await Electron.WindowManager.CreateWindowAsync();
    //Electron.WindowManager.BrowserWindows.First().WebContents.OpenDevTools();
});

app.Run();

