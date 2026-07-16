/* ============================================================
   PichangaGO V2 - Script 03
   AGREGAR SLUG A CANCHAS PARA URLS AMIGABLES
   ============================================================ */

SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
SET XACT_ABORT ON;
GO

BEGIN TRY
    BEGIN TRANSACTION;

    -- 1. AGREGAR COLUMNA (si no existe)
    IF NOT EXISTS (
        SELECT 1 FROM sys.columns
        WHERE object_id = OBJECT_ID(N'[dbo].[CANCHAS]')
          AND name = 'SLUG'
    )
    BEGIN
        ALTER TABLE [dbo].[CANCHAS] ADD [SLUG] VARCHAR(150) NULL;
    END

    -- 2. GENERAR SLUG BASE: solo MINUSCULAS + quitar acentos
    UPDATE [dbo].[CANCHAS]
    SET [SLUG] = LOWER([NOMBRE])
    WHERE [SLUG] IS NULL;

    UPDATE [dbo].[CANCHAS] SET [SLUG] = REPLACE([SLUG], N'á', 'a') WHERE [SLUG] LIKE N'%á%';
    UPDATE [dbo].[CANCHAS] SET [SLUG] = REPLACE([SLUG], N'é', 'e') WHERE [SLUG] LIKE N'%é%';
    UPDATE [dbo].[CANCHAS] SET [SLUG] = REPLACE([SLUG], N'í', 'i') WHERE [SLUG] LIKE N'%í%';
    UPDATE [dbo].[CANCHAS] SET [SLUG] = REPLACE([SLUG], N'ó', 'o') WHERE [SLUG] LIKE N'%ó%';
    UPDATE [dbo].[CANCHAS] SET [SLUG] = REPLACE([SLUG], N'ú', 'u') WHERE [SLUG] LIKE N'%ú%';
    UPDATE [dbo].[CANCHAS] SET [SLUG] = REPLACE([SLUG], N'ñ', 'n') WHERE [SLUG] LIKE N'%ñ%';
    UPDATE [dbo].[CANCHAS] SET [SLUG] = REPLACE([SLUG], N'ü', 'u') WHERE [SLUG] LIKE N'%ü%';
    UPDATE [dbo].[CANCHAS] SET [SLUG] = REPLACE([SLUG], N'Á', 'a') WHERE [SLUG] LIKE N'%Á%';
    UPDATE [dbo].[CANCHAS] SET [SLUG] = REPLACE([SLUG], N'É', 'e') WHERE [SLUG] LIKE N'%É%';
    UPDATE [dbo].[CANCHAS] SET [SLUG] = REPLACE([SLUG], N'Í', 'i') WHERE [SLUG] LIKE N'%Í%';
    UPDATE [dbo].[CANCHAS] SET [SLUG] = REPLACE([SLUG], N'Ó', 'o') WHERE [SLUG] LIKE N'%Ó%';
    UPDATE [dbo].[CANCHAS] SET [SLUG] = REPLACE([SLUG], N'Ú', 'u') WHERE [SLUG] LIKE N'%Ú%';
    UPDATE [dbo].[CANCHAS] SET [SLUG] = REPLACE([SLUG], N'Ñ', 'n') WHERE [SLUG] LIKE N'%Ñ%';

    -- 3. REEMPLAZAR CARACTERES NO ALFANUMERICOS POR GUION
    UPDATE [dbo].[CANCHAS] SET [SLUG] = REPLACE([SLUG], ' ', '-')  WHERE [SLUG] LIKE '% %';
    UPDATE [dbo].[CANCHAS] SET [SLUG] = REPLACE([SLUG], '/', '-')  WHERE [SLUG] LIKE '%/%';
    UPDATE [dbo].[CANCHAS] SET [SLUG] = REPLACE([SLUG], '&', '-')  WHERE [SLUG] LIKE '%&%';
    UPDATE [dbo].[CANCHAS] SET [SLUG] = REPLACE([SLUG], '.', '-')  WHERE [SLUG] LIKE '%.%';
    UPDATE [dbo].[CANCHAS] SET [SLUG] = REPLACE([SLUG], ',', '-')  WHERE [SLUG] LIKE '%,%';
    UPDATE [dbo].[CANCHAS] SET [SLUG] = REPLACE([SLUG], '''', '-') WHERE [SLUG] LIKE '%''%';
    UPDATE [dbo].[CANCHAS] SET [SLUG] = REPLACE([SLUG], '"', '-')  WHERE [SLUG] LIKE '%"%';
    UPDATE [dbo].[CANCHAS] SET [SLUG] = REPLACE([SLUG], '#', '-')  WHERE [SLUG] LIKE '%#%';
    UPDATE [dbo].[CANCHAS] SET [SLUG] = REPLACE([SLUG], '(', '-')  WHERE [SLUG] LIKE '%(%';
    UPDATE [dbo].[CANCHAS] SET [SLUG] = REPLACE([SLUG], ')', '-')  WHERE [SLUG] LIKE '%)%';

    -- 4. LIMPIAR GUIONES MULTIPLES (solo adyacentes)
    WHILE EXISTS (SELECT 1 FROM [dbo].[CANCHAS] WHERE [SLUG] LIKE '%--%')
    BEGIN
        UPDATE [dbo].[CANCHAS] SET [SLUG] = REPLACE([SLUG], '--', '-')
        WHERE [SLUG] LIKE '%--%';
    END

    -- 5. QUITAR GUIONES AL INICIO Y FINAL
    UPDATE [dbo].[CANCHAS] SET [SLUG] = SUBSTRING([SLUG], 2, LEN([SLUG]) - 1) WHERE [SLUG] LIKE '-%';
    UPDATE [dbo].[CANCHAS] SET [SLUG] = LEFT([SLUG], LEN([SLUG]) - 1)           WHERE [SLUG] LIKE '%-';

    -- 6. AGREGAR SUFIJO DEL ID PARA UNICIDAD
    UPDATE [dbo].[CANCHAS]
    SET [SLUG] = [SLUG] + '-' + RIGHT([ID_CANCHA], 6)
    WHERE [SLUG] IS NOT NULL;

    -- 7. NOT NULL Y UNIQUE
    ALTER TABLE [dbo].[CANCHAS] ALTER COLUMN [SLUG] VARCHAR(150) NOT NULL;

    IF NOT EXISTS (
        SELECT 1 FROM sys.indexes
        WHERE object_id = OBJECT_ID(N'[dbo].[CANCHAS]')
          AND name = 'UQ_CANCHAS_SLUG'
    )
    BEGIN
        ALTER TABLE [dbo].[CANCHAS] ADD CONSTRAINT [UQ_CANCHAS_SLUG] UNIQUE ([SLUG]);
    END

    -- 8. INDICE DE BUSQUEDA
    IF NOT EXISTS (
        SELECT 1 FROM sys.indexes
        WHERE object_id = OBJECT_ID(N'[dbo].[CANCHAS]')
          AND name = 'IX_CANCHAS_SLUG'
    )
    BEGIN
        CREATE NONCLUSTERED INDEX [IX_CANCHAS_SLUG]
        ON [dbo].[CANCHAS]([SLUG])
        INCLUDE ([NOMBRE], [ESTADO], [PRECIO_BASE]);
    END

    COMMIT TRANSACTION;
    PRINT 'Slugs generados correctamente.';
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
    DECLARE @MSG NVARCHAR(4000) = ERROR_MESSAGE();
    DECLARE @SEV INT = ERROR_SEVERITY();
    DECLARE @STA INT = ERROR_STATE();
    RAISERROR(@MSG, @SEV, @STA);
END CATCH;
GO
